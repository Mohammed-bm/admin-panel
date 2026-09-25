<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\PaymentStatus;
use Illuminate\Support\Carbon;
use App\Models\StripeSubscription;
use App\Models\OrganizationCapacity;
use App\Models\User;
use App\Models\Plan;
use App\Models\PlanAllowance;
use App\Models\AuditLog;
use App\Models\Organization;
use App\Services\SubscriptionProvisioningService;
use App\Services\AdminSubscriptionService;
use App\Services\AdminPaymentService;
use App\Services\AdminCapacityService;
use App\Models\MailboxLicense;
use App\Models\MyMailbox;

use Illuminate\Support\Facades\Log;

class OrganizationController extends Controller
{
    public function __construct(
        private SubscriptionProvisioningService $subscriptionProvisioningService,
        private AdminSubscriptionService $adminSubscriptionService,
        private AdminPaymentService $adminPaymentService,
        private AdminCapacityService $adminCapacityService
    ) {}
    public function index(Request $request)
    {
        $query = Organization::query()
            ->join('users', 'organizations.user_id', '=', 'users.id')
            ->select(
                'organizations.*',
                'users.email'
            );

        // Date filter
        $filter = $request->input('filter');

        if ($filter === 'today') {
            $query->whereDate('organizations.created_at', Carbon::today());
        } elseif ($filter === 'last-7-days') {
            $query->where(
                'organizations.created_at',
                '>=',
                Carbon::now()->subDays(7)->startOfDay()
            );
        } elseif ($filter === 'last-15-days') {
            $query->where(
                'organizations.created_at',
                '>=',
                Carbon::now()->subDays(15)->startOfDay()
            );
        } elseif ($filter === 'last-30-days') {
            $query->where(
                'organizations.created_at',
                '>=',
                Carbon::now()->subDays(30)->startOfDay()
            );
        } elseif ($filter === 'last-year') {
            $query->where(
                'organizations.created_at',
                '>=',
                Carbon::now()->subYear()->startOfDay()
            );
        } elseif (str_starts_with($filter ?? '', 'custom:')) {
            $parts = explode(':', $filter);

            if (count($parts) === 3) {
                $start = min($parts[1], $parts[2]);
                $end = max($parts[1], $parts[2]);

                $query->whereBetween('organizations.created_at', [
                    Carbon::parse($start)->startOfDay(),
                    Carbon::parse($end)->endOfDay(),
                ]);
            }
        }

        $search = $request->input('search');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('website', 'like', "%{$search}%")
                    ->orWhere('users.email', 'like', "%{$search}%");
            });
        }

        $organizations = $query
            ->orderBy('organizations.created_at', 'desc')
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        $organizations->getCollection()->transform(function ($org) {
            $org->date = $org->created_at ? $org->created_at->format('h:i A, d M Y') : null;

            return $org;
        });

        $plans = Plan::where('is_active', true)->get();

        return Inertia::render('Organization/Index', [
            'organizations' => $organizations,
            'plans' => $plans,
            'filters' => $request->only([
                'search',
                'filter',
                'page',
                'per_page',
            ]),
        ]);
    }
    public function show(Organization $organization)
    {
        $subscriptions = StripeSubscription::where(
            'organization_id',
            $organization->id
        )->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($subscription) {
                $subscription->trial_ends_at = $subscription->trial_ends_at
                    ? Carbon::parse($subscription->trial_ends_at)->format('g:i A, M j, Y')
                    : null;

                $subscription->ends_at = $subscription->ends_at
                    ? Carbon::parse($subscription->ends_at)->format('g:i A, M j, Y')
                    : null;

                $subscription->created_date = $subscription->created_at
                    ? $subscription->created_at->format('g:i A, M j, Y')
                    : null;

                $subscription->updated_date = $subscription->updated_at
                    ? $subscription->updated_at->format('g:i A, M j, Y')
                    : null;

                return $subscription;
            });


        $payments = PaymentStatus::where(
            'organization_id',
            $organization->id
        )->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($payments) {
                $payments->created_date = $payments->created_at
                    ? $payments->created_at->format('g:i A, M j, Y')
                    : null;

                $payments->updated_date = $payments->updated_at
                    ? $payments->updated_at->format('g:i A, M j, Y')
                    : null;

                return $payments;
            });

        $credits = OrganizationCapacity::where(
            'organization_id',
            $organization->id
        )->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($credit) {
                $credit->created_date = $credit->created_at
                    ? $credit->created_at->format('g:i A, M j, Y')
                    : null;

                $credit->updated_date = $credit->updated_at
                    ? $credit->updated_at->format('g:i A, M j, Y')
                    : null;

                return $credit;
            });

        $licenses = MailboxLicense::whereHas('bundle', function ($query) use ($organization) {
            $query->where('organization_id', $organization->id);
        })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $mailboxes = MyMailbox::with([
            'assignments' => function ($query) {
                $query->where('status', 'active')->with('license.bundle');
            }
        ])
            ->whereHas('assignments', function ($query) {
                $query->where('status', 'active');
            })
            ->whereHas('assignments.license.bundle', function ($query) use ($organization) {
                $query->where('organization_id', $organization->id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Organization/Show', [
            'organization' => $organization,
            'subscriptions' => $subscriptions,
            'payments' => $payments,
            'credits' => $credits,
            'licenses' => $licenses,
            'mailboxes' => $mailboxes,
        ]);
    }
    public function assignPlan(Request $request, Organization $organization)
    {
        try {
            // 2. resolve user
            $userId = $request->input('user_id');

            if ($userId) {
                $user = User::find($userId);

                if (!$user) {
                    return back()->withErrors([
                        'user_id' => 'User not found'
                    ]);
                }
            } else {
                $capacity = OrganizationCapacity::where(
                    'organization_id',
                    $organization->id
                )->first();

                if (!$capacity) {
                    return back()->withErrors([
                        'user_id' => 'No user found for this organization'
                    ]);
                }

                $userId = $capacity->user_id;

                if (!$userId) {
                    return back()->withErrors([
                        'user_id' => 'No user found for this organization'
                    ]);
                }
            }

            // 3. find plan
            $planId = $request->input('plan_id');

            $plan = Plan::where('id', $planId)
                ->where('is_active', true)
                ->first();

            if (!$plan) {
                return back()->withErrors([
                    'plan_id' => 'Plan not found or not active'
                ]);
            }

            // 4. check current plan
            $allowances = PlanAllowance::where(
                'plan_id',
                $plan->id
            )->get();

            if ($allowances->isEmpty()) {
                return back()->withErrors([
                    'plan_id' => 'This plan has no allowances'
                ]);
            }

            // 5. call SubscriptionProvisioningService
            if ($organization->plan === $plan->slug) {
                return back()->withErrors([
                    'plan_id' => 'Organization is already on this plan'
                ]);
            }

            // 6. create audit log
            $oldPlan = $organization->plan;

            // 7. return response
            $this->subscriptionProvisioningService->provisionPlan(
                $userId,
                $organization->id,
                $plan->slug,
                null,
                'admin_assignment',
                'admin-' . $organization->id . '-' . uniqid()
            );

            $this->adminPaymentService->createAdminGrantPayment(
                $userId,
                $organization->id,
                null,
                $plan->name,
            );

            $this->adminSubscriptionService->assignAdminSubscription(
                $organization->id,
                $userId,
                $plan->name
            );

            AuditLog::create([
                'user_id' => auth()->id(),
                'organization_id' => $organization->id,
                'app_id' => null,
                'action' => 'Plan Assigned',
                'subject_type' => 'Organization',
                'description' => "Assigned plan '{$plan->name}' to organization {$organization->id}",
                'old_values' => [
                    'plan' => $oldPlan,
                ],
                'new_values' => [
                    'plan' => $plan->slug,
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return back()->with(
                'success',
                'Plan assigned successfully'
            );
        } catch (\Throwable $e) {

            // Step 10: Log unexpected error

            Log::error('Admin plan assignment failed', [
                'organization_id' => $organization->id,
                'user_id' => $userId ?? null,
                'plan_id' => $plan->id ?? null,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'plan_id' => 'Plan assignment failed'
            ]);
        }
    }
    public function licenses(Organization $organization)
    {
        $licenses = MailboxLicense::whereHas('bundle', function ($query) use ($organization) {
            $query->where('organization_id', $organization->id);
        })->get();

        return response()->json([
            'organization_id' => $organization->id,
            'licenses' => $licenses,
        ]);
    }
    public function updateCapacity(
        Request $request,
        Organization $organization
    ) {
        try {
            // Validate the complete capacities object
            $validated = $request->validate([
                'capacities' => ['required', 'array'],
                'capacities.*' => ['integer', 'min:-1'],
            ]);

            // Get the existing capacity record
            $oldCapacity = OrganizationCapacity::where(
                'organization_id',
                $organization->id
            )
                ->where('is_active', true)
                ->first();

            if (!$oldCapacity) {
                return back()->withErrors([
                    'capacities' => 'No active capacity record found for this organization.'
                ]);
            }

            // Keep the old values for the audit log
            $oldCapacities = $oldCapacity->capacities;

            // Send the actual business logic to the service
            $updatedCapacity = $this->adminCapacityService->updateCapacity(
                $organization,
                $validated['capacities']
            );

            // Create audit log
            AuditLog::create([
                'user_id' => auth()->id(),
                'organization_id' => $organization->id,
                'app_id' => null,
                'action' => 'Capacity Updated',
                'subject_type' => 'Organization',
                'description' => "Updated capacities for organization {$organization->id}",
                'old_values' => [
                    'capacities' => $oldCapacities,
                ],
                'new_values' => [
                    'capacities' => $updatedCapacity->capacities,
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return back()->with(
                'success',
                'Organization capacities updated successfully.'
            );
        } catch (\Throwable $e) {

            Log::error('Admin capacity update failed', [
                'organization_id' => $organization->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'capacities' => $e->getMessage(),
            ]);
        }
    }
}
