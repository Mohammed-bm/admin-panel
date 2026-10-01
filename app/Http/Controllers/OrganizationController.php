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
use App\Models\App;
use Illuminate\Support\Facades\DB;
use App\Models\EmailCampaign;
use App\Models\EmailMetric;
use App\Models\EmailCampaignRecipient;
use App\Services\SubscriptionProvisioningService;
use App\Services\AdminSubscriptionService;
use App\Services\AdminPaymentService;
use App\Services\AdminCapacityService;
use App\Models\MailboxLicense;
use App\Models\MyMailbox;
use App\Support\Filters\DateFilter;
use App\Support\Filters\SearchFilter;

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
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        DateFilter::apply(
            $query,
            $filter,
            $startDate,
            $endDate,
            'organizations.created_at'
        );

        $search = $request->input('search');

        SearchFilter::apply(
            $query,
            $search,
            [
                'organizations.name',
                'organizations.website',
                'users.email',
            ]
        );

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
    public function show(Request $request, Organization $organization)
    {
        $tab = $request->input('tab', 'subscriptions');
        $subTab = $request->input('sub_tab', 'emails');

        $subscriptions = [];

        if ($tab === 'subscriptions') {
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
        }

        $payments = [];

        if ($tab === 'payments') {
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
        }

        $credits = [];

        if ($tab === 'credits') {
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
        }

        $licensesFilter = $request->input('licenses_filter');
        $licensesStartDate = $request->input('licenses_start_date');
        $licensesEndDate = $request->input('licenses_end_date');

        $licenses = [];

        if ($tab === 'licenses') {
            $licenseQuery = MailboxLicense::with('bundle')
                ->whereHas('bundle', function ($query) use ($organization) {
                    $query->where('organization_id', $organization->id);
                });

            DateFilter::apply(
                $licenseQuery,
                $licensesFilter,
                $licensesStartDate,
                $licensesEndDate,
                'mailbox_licenses.created_at'
            );

            $licensesPerPage = $request->input('licenses_per_page', 10);

            $licenses = $licenseQuery
                ->orderBy('created_at', 'desc')
                ->paginate(
                    $licensesPerPage,
                    ['*'],
                    'licenses_page'
                )
                ->appends([
                    'tab' => 'licenses',
                    'licenses_filter' => $licensesFilter,
                    'licenses_start_date' => $licensesStartDate,
                    'licenses_end_date' => $licensesEndDate,
                    'licenses_per_page' => $licensesPerPage,
                ]);
        }

        $mailboxesFilter = $request->input('mailboxes_filter');
        $mailboxesStartDate = $request->input('mailboxes_start_date');
        $mailboxesEndDate = $request->input('mailboxes_end_date');

        $mailboxes = [];

        if ($tab === 'mailboxes') {
            $mailboxesQuery = MyMailbox::with([
                'assignments' => function ($query) {
                    $query->where('status', 'active')
                        ->with('license.bundle');
                }
            ])
                ->whereHas('assignments', function ($query) {
                    $query->where('status', 'active');
                })
                ->whereHas('assignments.license.bundle', function ($query) use ($organization) {
                    $query->where(
                        'organization_id',
                        $organization->id
                    );
                });

            DateFilter::apply(
                $mailboxesQuery,
                $mailboxesFilter,
                $mailboxesStartDate,
                $mailboxesEndDate,
                'my_mailboxes.created_at'
            );

            $mailboxesPerPage = $request->input(
                'mailboxes_per_page',
                10
            );

            $mailboxes = $mailboxesQuery
                ->orderBy('created_at', 'desc')
                ->paginate(
                    $mailboxesPerPage,
                    ['*'],
                    'mailboxes_page'
                )
                ->appends([
                    'tab' => 'mailboxes',
                    'mailboxes_filter' => $mailboxesFilter,
                    'mailboxes_start_date' => $mailboxesStartDate,
                    'mailboxes_end_date' => $mailboxesEndDate,
                    'mailboxes_per_page' => $mailboxesPerPage,
                ]);
        }

        $apps = [];

        if ($tab === 'apps') {

            $appsPerPage = $request->integer('per_page', 10);
            $campaignsPerPage = $request->integer('campaigns_per_page', 10);

            $apps = App::where('organization_id', $organization->id)
                ->select(
                    'id',
                    'uuid',
                    'name',
                    'organization_id'
                )
                ->withMax('emailCampaigns', 'updated_at')
                ->orderByDesc('email_campaigns_max_updated_at')
                ->paginate($appsPerPage);

            $apps->getCollection()->transform(function ($app) use ($subTab, $campaignsPerPage) {

                if ($subTab === 'emails') {
                    $campaigns = $app->emailCampaigns()
                        ->with('metric')
                        ->withCount('recipients')
                        ->orderByDesc('updated_at')
                        ->paginate(
                            $campaignsPerPage,
                            ['*'],
                            "campaigns_page_{$app->id}"
                        );

                    // 1. Calculate summary stats matching the recipient relationship
                    $totalCampaigns = DB::table('email_campaigns')
                        ->where('app_uuid', $app->uuid)
                        ->count();

                    $totalRecipients = DB::table('email_campaigns as ec')
                        ->join('email_campaign_recipients as ecr', 'ecr.email_campaign_id', '=', 'ec.id')
                        ->where('ec.app_uuid', $app->uuid)
                        ->count();

                    $metrics = DB::table('email_campaigns as ec')
                        ->join('email_metrics as em', 'em.campaign_id', '=', 'ec.id')
                        ->where('ec.app_uuid', $app->uuid)
                        ->selectRaw('
                    COALESCE(SUM(em.success_count), 0) AS delivered,
                    COALESCE(SUM(em.open_count), 0) AS opened,
                    COALESCE(SUM(em.click_count), 0) AS clicked,
                    COALESCE(SUM(em.hard_bounce + em.soft_bounce), 0) AS failed
                    ')
                        ->first();

                    $delivered = $metrics->delivered ?? 0;
                    $opened = $metrics->opened ?? 0;
                    $clicked = $metrics->clicked ?? 0;
                    $failed = $metrics->failed ?? 0;

                    $app->stats = [
                        'campaigns' => $totalCampaigns,
                        'recipients' => $totalRecipients,
                        'delivered' => $delivered,
                        'delivered_percentage' => $totalRecipients > 0 ? round(($delivered / $totalRecipients) * 100, 2) : 0,
                        'opened' => $opened,
                        'opened_percentage' => $delivered > 0 ? round(($opened / $delivered) * 100, 2) : 0,
                        'clicked' => $clicked,
                        'clicked_percentage' => $delivered > 0 ? round(($clicked / $delivered) * 100, 2) : 0,
                        'failed' => $failed,
                    ];

                    // 2. Transform campaign collection for the UI
                    $campaigns->getCollection()->transform(function ($campaign) {
                        return [
                            'campaign_name' => $campaign->campaign_name,
                            'type' => $campaign->type,
                            'recipients' => $campaign->recipients_count,
                            'sent_count' => $campaign->metric?->sent_count ?? 0,
                            'open_count' => $campaign->metric?->open_count ?? 0,
                            'click_count' => $campaign->metric?->click_count ?? 0,
                            'soft_bounce' => $campaign->metric?->soft_bounce ?? 0,
                            'hard_bounce' => $campaign->metric?->hard_bounce ?? 0,
                            'launched' => $campaign->updated_at?->format('h:i A, d M Y'),
                        ];
                    });

                    $app->campaigns = $campaigns;
                } elseif ($subTab === 'sms') {

                    $campaigns = $app->smsCampaigns()
                        ->with('metric')
                        ->orderByDesc('updated_at')
                        ->paginate(
                            $campaignsPerPage,
                            ['*'],
                            "campaigns_page_{$app->id}"
                        );

                    // 1. Calculate summary stats for SMS
                    $totalCampaigns = DB::table('sms_campaigns')
                        ->where('app_uuid', $app->uuid)
                        ->count();

                    // Sum amount where debited_from is wallet
                    $totalWalletAmount = DB::table('sms_campaigns')
                        ->where('app_uuid', $app->uuid)
                        ->where('debited_from', 'wallet')
                        ->sum('amount');

                    $metrics = DB::table('sms_campaigns as sc')
                        ->join('sms_metrics as sm', 'sm.campaign_id', '=', 'sc.id')
                        ->where('sc.app_uuid', $app->uuid)
                        ->selectRaw('
            COALESCE(SUM(sm.total_records), 0) AS total_records,
            COALESCE(SUM(sm.sent_count), 0) AS sent_count,
            COALESCE(SUM(sm.failed_count), 0) AS failed_count
        ')
                        ->first();

                    $totalRecipients = $metrics->total_records ?? 0;
                    $sentCount = $metrics->sent_count ?? 0;
                    $failed = $metrics->failed_count ?? 0;
                    $delivered = max($sentCount - $failed, 0);

                    $app->stats = [
                        'campaigns' => $totalCampaigns,
                        'recipients' => $totalRecipients,
                        'sent' => $sentCount,
                        'delivered' => $delivered,
                        'delivered_percentage' => $totalRecipients > 0 ? round(($delivered / $totalRecipients) * 100, 2) : 0,
                        'failed' => $failed,
                        'amount' => round($totalWalletAmount, 2),
                    ];

                    // 2. Transform SMS campaign collection for the UI
                    $campaigns->getCollection()->transform(function ($campaign) {
                        return [
                            'campaign_name' => $campaign->campaign_name,
                            'type' => $campaign->type,
                            'status' => $campaign->status,
                            'scheduled_timezone' => $campaign->scheduled_timezone,
                            'scheduled_time' => $campaign->scheduled_time
                                ? \Carbon\Carbon::parse($campaign->scheduled_time)->format('h:i A, d M Y')
                                : null,
                            'amount' => $campaign->amount,
                            'debited_from' => $campaign->debited_from,
                            'total_records' => $campaign->metric?->total_records ?? 0,
                            'sent_count' => $campaign->metric?->sent_count ?? 0,
                            'failed_count' => $campaign->metric?->failed_count ?? 0,
                            'updated_at' => $campaign->metric?->updated_at?->format('h:i A, d M Y'),
                        ];
                    });

                    $app->campaigns = $campaigns;
                }

                return $app;
            });
        }

        return Inertia::render('Organization/Show', [
            'organization' => $organization,
            'subscriptions' => $subscriptions,
            'payments' => $payments,
            'credits' => $credits,
            'licenses' => $licenses,
            'mailboxes' => $mailboxes,
            'apps' => $apps,

            'licenseFilters' => [
                'filter' => $licensesFilter,
                'start_date' => $licensesStartDate,
                'end_date' => $licensesEndDate,
            ],

            'mailboxFilters' => [
                'filter' => $mailboxesFilter,
                'start_date' => $mailboxesStartDate,
                'end_date' => $mailboxesEndDate,
            ],
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

                $userId = $capacity?->user_id ?? $organization->user_id ?? auth()->id();

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
                'plan_id' => 'Plan assignment failed: ' . $e->getMessage()
            ]);
        }
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
