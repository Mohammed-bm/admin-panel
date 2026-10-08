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
use App\Models\PushNotification;
use App\Models\PushNotificationCampaignDevice;
use Illuminate\Support\Facades\Log;
use App\Models\SendReport;
use App\Models\Notification;
use App\Models\SmsMetric;
use App\Models\TransactionalLogDetection;

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
                    return [
                        'id'            => $subscription->id,
                        'stripe_status' => $subscription->stripe_status,
                        'amount'        => $subscription->amount,

                        // Direct null-safe formatting (No Carbon::parse needed!)
                        'trial_ends_at' => $subscription->trial_ends_at?->format('g:i A, M j, Y'),
                        'ends_at'       => $subscription->ends_at?->format('g:i A, M j, Y'),
                        'created_date'  => $subscription->created_at?->format('g:i A, M j, Y'),
                        'updated_date'  => $subscription->updated_at?->format('g:i A, M j, Y'),
                    ];
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
            // $campaignsPerPage = $request->integer('campaigns_per_page', 10);

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

            $apps->getCollection()->transform(function ($app) use ($request, $subTab) {

                $campaignPageParam = "campaigns_page_{$app->id}";
                $campaignPerPageParam = "campaigns_per_page_{$app->id}";
                $campaignsPerPage = $request->integer($campaignPerPageParam, 10);

                if ($subTab === 'emails') {

                    // 1. Fetch paginated email campaigns with relations and counts
                    $campaigns = $app->emailCampaigns()
                        ->with('metric')
                        ->withCount('recipients')
                        ->latest('updated_at')
                        ->paginate($campaignsPerPage, ['*'], $campaignPageParam);

                    // 2. Compute aggregate metrics using Eloquent queries
                    $totalRecipients = EmailCampaignRecipient::whereHas('emailCampaign', fn($q) => $q->where('app_uuid', $app->uuid))->count();

                    $metricsQuery = EmailMetric::whereHas('emailCampaign', fn($q) => $q->where('app_uuid', $app->uuid));

                    $delivered = (int) (clone $metricsQuery)->sum('success_count');
                    $opened    = (int) (clone $metricsQuery)->sum('open_count');
                    $clicked   = (int) (clone $metricsQuery)->sum('click_count');
                    $failed    = (int) (clone $metricsQuery)->sum(DB::raw('hard_bounce + soft_bounce'));

                    $app->stats = [
                        'campaigns'            => $campaigns->total(),
                        'recipients'           => $totalRecipients,
                        'delivered'            => $delivered,
                        'delivered_percentage' => $totalRecipients > 0 ? round(($delivered / $totalRecipients) * 100, 2) : 0,
                        'opened'               => $opened,
                        'opened_percentage'    => $delivered > 0 ? round(($opened / $delivered) * 100, 2) : 0,
                        'clicked'              => $clicked,
                        'clicked_percentage'   => $delivered > 0 ? round(($clicked / $delivered) * 100, 2) : 0,
                        'failed'               => $failed,
                    ];

                    // 3. Transform campaign collection for UI
                    $campaigns->getCollection()->transform(function ($campaign) {
                        return [
                            'campaign_name' => $campaign->campaign_name,
                            'type'          => $campaign->type,
                            'recipients'    => (int) $campaign->recipients_count,
                            'sent_count'    => (int) ($campaign->metric?->sent_count ?? 0),
                            'open_count'    => (int) ($campaign->metric?->open_count ?? 0),
                            'click_count'   => (int) ($campaign->metric?->click_count ?? 0),
                            'soft_bounce'   => (int) ($campaign->metric?->soft_bounce ?? 0),
                            'hard_bounce'   => (int) ($campaign->metric?->hard_bounce ?? 0),
                            'launched'      => $campaign->updated_at
                                ? \Carbon\Carbon::parse($campaign->updated_at)->format('h:i A, d M Y')
                                : null,
                        ];
                    });

                    $app->campaigns = $campaigns;
                } elseif ($subTab === 'sms') {

                    // 1. Fetch paginated SMS campaigns with relations
                    $campaigns = $app->smsCampaigns()
                        ->with('metric')
                        ->latest('updated_at')
                        ->paginate($campaignsPerPage, ['*'], $campaignPageParam);

                    // 2. Compute aggregate metrics using Eloquent queries
                    $campaignIds = $app->smsCampaigns()->pluck('id');

                    $totalWalletAmount = (float) $app->smsCampaigns()
                        ->where('debited_from', 'wallet')
                        ->sum('amount');

                    $metricsQuery = SmsMetric::whereIn('campaign_id', $campaignIds);

                    $totalRecipients = (int) (clone $metricsQuery)->sum('total_records');
                    $sentCount       = (int) (clone $metricsQuery)->sum('sent_count');
                    $failed          = (int) (clone $metricsQuery)->sum('failed_count');
                    $delivered       = max($sentCount - $failed, 0);

                    $app->stats = [
                        'campaigns'            => $campaigns->total(),
                        'recipients'           => $totalRecipients,
                        'sent'                 => $sentCount,
                        'delivered'            => $delivered,
                        'delivered_percentage' => $totalRecipients > 0 ? round(($delivered / $totalRecipients) * 100, 2) : 0,
                        'failed'               => $failed,
                        'amount'               => round($totalWalletAmount, 2),
                    ];

                    // 3. Transform campaign collection for UI
                    $campaigns->getCollection()->transform(function ($campaign) {
                        return [
                            'campaign_name'      => $campaign->campaign_name,
                            'type'               => $campaign->type,
                            'status'             => $campaign->status,
                            'scheduled_timezone' => $campaign->scheduled_timezone,
                            'scheduled_time'     => $campaign->scheduled_time
                                ? \Carbon\Carbon::parse($campaign->scheduled_time)->format('h:i A, d M Y')
                                : null,
                            'amount'             => $campaign->amount,
                            'debited_from'       => $campaign->debited_from,
                            'total_records'      => (int) ($campaign->metric?->total_records ?? 0),
                            'sent_count'         => (int) ($campaign->metric?->sent_count ?? 0),
                            'failed_count'       => (int) ($campaign->metric?->failed_count ?? 0),
                            'updated_at'         => $campaign->metric?->updated_at
                                ? \Carbon\Carbon::parse($campaign->metric->updated_at)->format('h:i A, d M Y')
                                : null,
                        ];
                    });

                    $app->campaigns = $campaigns;
                } elseif ($subTab === 'push') {

                    // 1. Fetch paginated push notifications with conditional relationship counts
                    $campaigns = $app->pushNotifications()
                        ->select([
                            'id',
                            'app_id',
                            'Title',
                            'template_name',
                            'type',
                            'status',
                            'shedule_time',
                            'updated_at'
                        ])
                        ->withCount([
                            'campaignDevices as total_devices',
                            'campaignDevices as pending_count' => fn($q) => $q->where('status', 0),
                            'campaignDevices as sent_count' => fn($q) => $q->where('status', 1),
                            'campaignDevices as temp_blocked_count' => fn($q) => $q->where('status', 2),
                            'campaignDevices as perm_blocked_count' => fn($q) => $q->where('status', 3),
                        ])
                        ->latest('id')
                        ->paginate($campaignsPerPage, ['*'], $campaignPageParam);

                    // 2. Fetch overall metrics across all device records for this app via relationship query
                    $deviceQuery = PushNotificationCampaignDevice::whereHas('pushNotification', fn($q) => $q->where('app_id', $app->id));

                    $app->stats = [
                        'total_push_notification'   => $campaigns->total(),
                        'total_occurrence_count'    => (int) (clone $deviceQuery)->count(),
                        'total_pending'             => (int) (clone $deviceQuery)->where('status', 0)->count(),
                        'total_sent'                => (int) (clone $deviceQuery)->where('status', 1)->count(),
                        'total_temporary_blocked'   => (int) (clone $deviceQuery)->where('status', 2)->count(),
                        'total_permanently_blocked' => (int) (clone $deviceQuery)->where('status', 3)->count(),
                    ];

                    // 3. Transform the paginated Eloquent collection for UI
                    $campaigns->getCollection()->transform(function ($campaign) {
                        return [
                            'push_notification_id' => $campaign->id,
                            'title'                => $campaign->Title,
                            'template_name'        => $campaign->template_name,
                            'type'                 => $campaign->type,
                            'status'               => $campaign->status,
                            'schedule_time'        => $campaign->shedule_time
                                ? $campaign->shedule_time->format('h:i A, d M Y')
                                : null,
                            'total_devices'        => (int) $campaign->total_devices,
                            'pending_count'        => (int) $campaign->pending_count,
                            'sent_count'           => (int) $campaign->sent_count,
                            'temp_blocked_count'   => (int) $campaign->temp_blocked_count,
                            'perm_blocked_count'   => (int) $campaign->perm_blocked_count,
                            'updated_at'           => $campaign->updated_at
                                ? $campaign->updated_at->format('h:i A, d M Y')
                                : null,
                        ];
                    });

                    $app->campaigns = $campaigns;
                } elseif ($subTab === 'web') {

                    // 1. Fetch paginated web notifications with conditional counts using Eloquent
                    $campaigns = $app->notifications()
                        ->select([
                            'id',
                            'app_id',
                            'title',
                            'body',
                            'status',
                            'total_targets',
                            'scheduled_at',
                            'updated_at',
                        ])
                        ->withCount([
                            'sendReports as delivered' => fn($q) => $q->where('status', 'delivered'),
                            'sendReports as failed'    => fn($q) => $q->where('status', 'failed'),
                        ])
                        ->latest('updated_at')
                        ->paginate($campaignsPerPage, ['*'], $campaignPageParam);

                    // 2. Fetch summary metrics strictly through Eloquent models
                    $sendReportQuery = SendReport::whereHas('notification', fn($q) => $q->where('app_id', $app->id));

                    $app->stats = [
                        'total_push_notification' => $campaigns->total(),
                        'total_devices'           => (int) $app->notifications()->sum('total_targets'),
                        'total_delivered'         => (int) (clone $sendReportQuery)->where('status', 'delivered')->count(),
                        'total_failed'            => (int) (clone $sendReportQuery)->where('status', 'failed')->count(),
                    ];

                    // 3. Transform the paginated Eloquent collection for the UI
                    $campaigns->getCollection()->transform(function ($notification) {
                        return [
                            'id'            => $notification->id,
                            'title'         => $notification->title,
                            'body'          => $notification->body,
                            'status'        => $notification->status,
                            'total_targets' => (int) ($notification->total_targets ?? 0),
                            'delivered'     => (int) $notification->delivered,
                            'failed'        => (int) $notification->failed,
                            'scheduled_at'  => $notification->scheduled_at
                                ? \Carbon\Carbon::parse($notification->scheduled_at)->format('h:i A, d M Y')
                                : null,
                            'launched_at' => $notification->updated_at
                                ? \Carbon\Carbon::parse($notification->updated_at)->format('h:i A, d M Y')
                                : null,
                        ];
                    });

                    $app->campaigns = $campaigns;
                } elseif ($subTab === 'transactional_email') {

                    // 1. Fetch paginated transactional email logs using Eloquent
                    $campaigns = $app->transactionalEmailLogs()
                        ->select([
                            'id',
                            'app_uuid',
                            'from_email',
                            'to_email',
                            'subject',
                            'template_key',
                            'mode',
                            'status',
                            'created_at',
                            'updated_at',
                        ])
                        ->latest('created_at')
                        ->paginate($campaignsPerPage, ['*'], $campaignPageParam);

                    // 2. Fetch summary metrics strictly through Eloquent models
                    $emailLogQuery = $app->transactionalEmailLogs();

                    $app->stats = [
                        'total_sent' => $campaigns->total(),
                        'success'    => (int) (clone $emailLogQuery)->where('status', 'success')->count(),
                        'failed'     => (int) (clone $emailLogQuery)->where('status', 'failed')->count(),
                    ];

                    // 3. Transform the paginated Eloquent collection for the UI
                    $campaigns->getCollection()->transform(function ($log) {
                        return [
                            'id'           => $log->id,
                            'from_email'   => $log->from_email,
                            'to_email'     => $log->to_email,
                            'subject'      => $log->subject,
                            'template_key' => $log->template_key,
                            'mode'         => $log->mode,
                            'status'       => $log->status,
                            'sent_at'      => $log->created_at
                                ? \Carbon\Carbon::parse($log->created_at)->format('h:i A, d M Y')
                                : null,
                            'updated_at'   => $log->updated_at
                                ? \Carbon\Carbon::parse($log->updated_at)->format('h:i A, d M Y')
                                : null,
                        ];
                    });

                    $app->campaigns = $campaigns;
                } elseif ($subTab === 'transactional_sms') {

                    // 1. Fetch paginated transactional SMS logs using Eloquent
                    $campaigns = $app->transactionalSmsLogs()
                        ->select([
                            'id',
                            'app_uuid',
                            'country_code',
                            'recepient_number',
                            'msg_title',
                            'text_preview',
                            'template_key',
                            'mode',
                            'status',
                            'scheduled_at',
                            'created_at',
                            'updated_at',
                        ])
                        ->latest('created_at')
                        ->paginate($campaignsPerPage, ['*'], $campaignPageParam);

                    // 2. Fetch summary metrics strictly through Eloquent models
                    $smsLogQuery = $app->transactionalSmsLogs();

                    $app->stats = [
                        'total_sent'           => $campaigns->total(),
                        'success'              => (int) (clone $smsLogQuery)->where('status', 'success')->count(),
                        'insufficient_balance' => (int) (clone $smsLogQuery)->where('status', 'Insufficient balance')->count(),
                        'failed'               => (int) (clone $smsLogQuery)->where('status', 'failed')->count(),
                    ];

                    // 3. Transform the paginated Eloquent collection for the UI
                    $campaigns->getCollection()->transform(function ($log) {
                        return [
                            'id'               => $log->id,
                            'recipient_number' => trim(($log->country_code ?? '') . ' ' . ($log->recepient_number ?? '')),
                            'msg_title'        => $log->msg_title,
                            'text_preview'     => $log->text_preview,
                            'template_key'     => $log->template_key,
                            'mode'             => $log->mode,
                            'status'           => $log->status,
                            'scheduled_at'     => $log->scheduled_at
                                ? \Carbon\Carbon::parse($log->scheduled_at)->format('h:i A, d M Y')
                                : null,
                            'sent_at'          => $log->created_at
                                ? \Carbon\Carbon::parse($log->created_at)->format('h:i A, d M Y')
                                : null,
                            'updated_at'       => $log->updated_at
                                ? \Carbon\Carbon::parse($log->updated_at)->format('h:i A, d M Y')
                                : null,
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
