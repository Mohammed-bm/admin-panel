<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Support\Filters\DateFilter;
use App\Support\Filters\SearchFilter;
use App\Models\EmailCampaign;
use App\Models\MyMailbox;
use App\Models\Organization;
use App\Models\PaymentStatus;
use App\Models\PushNotification;
use App\Models\SmsCampaign;
use App\Models\SendReport;
use App\Models\TransactionalLogDetection;
use App\Models\StripeSubscription;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        $filter = $request->input('filter');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        DateFilter::apply(
            $query,
            $filter,
            $startDate,
            $endDate,
            'created_at'
        );

        // Search
        $search = $request->input('search');

        SearchFilter::apply(
            $query,
            $search,
            [
                'id',
                'first_name',
                'last_name',
                'email',
            ]
        );

        $users = $query
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        $users->getCollection()->transform(function ($user) {
            $user->date = $user->created_at->format('h:i A, d M Y');

            return $user;
        });

        return Inertia::render('User/Index', [
            'users' => $users,
            'filters' => $request->only([
                'search',
                'filter',
                'page',
                'per_page',
            ]),
        ]);
    }
    public function show(Request $request, User $user)
    {
        // Check active tab parameter (defaults to 'activity' if not provided)
        $tab = $request->input('tab', 'activity');

        // Filter Inputs
        $tab       = $request->input('tab', 'activity');
        $filter    = $request->input('filter');
        $search    = $request->input('search');
        $startDate = $request->input('start_date');
        $endDate   = $request->input('end_date');
        $page      = (int) $request->input('page', 1);
        $perPage   = (int) $request->input('per_page', 10);


        // Initialize all variables as empty fallbacks
        $activities    = [];
        $organizations = [];
        $subscriptions = [];
        $pagination    = [];

        if ($tab === 'organizations') {
            // Fetch paginated organizations when the organizations tab is active
            $query = Organization::query()->where('user_id', $user->id);

            DateFilter::apply($query, $filter, $startDate, $endDate, 'created_at');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('website', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('email', 'like', "%{$search}%");
                        });
                });
            }

            $organizations = $query
                ->orderBy('created_at', 'desc')
                ->paginate($perPage)
                ->withQueryString();

            $organizations->getCollection()->transform(function ($org) {
                $org->date = $org->created_at ? $org->created_at->format('h:i A, d M Y') : null;
                return $org;
            });
        } elseif ($tab === 'activity') {
            // Fetch and merge activities only when the activity tab is active
            $paymentsQuery = PaymentStatus::with(['organization', 'app'])
                ->where('user_id', $user->id);
            DateFilter::apply($paymentsQuery, $filter, $startDate, $endDate, 'created_at');

            $emailCampaignsQuery = EmailCampaign::with('appByUuid.organization')
                ->where('user_id', $user->id);
            DateFilter::apply($emailCampaignsQuery, $filter, $startDate, $endDate, 'created_at');

            $pushNotificationsQuery = PushNotification::with('app.organization')
                ->where('user_id', $user->id);
            DateFilter::apply($pushNotificationsQuery, $filter, $startDate, $endDate, 'created_at');

            $mailboxesQuery = MyMailbox::with('app.organization')
                ->whereHas('app.organization', fn($q) => $q->where('user_id', $user->id));
            DateFilter::apply($mailboxesQuery, $filter, $startDate, $endDate, 'created_at');

            $smsCampaignsQuery = SmsCampaign::with('appByUuid.organization')
                ->whereHas('appByUuid.organization', fn($q) => $q->where('user_id', $user->id));
            DateFilter::apply($smsCampaignsQuery, $filter, $startDate, $endDate, 'created_at');

            $sendReportsQuery = SendReport::with('notification.app.organization')
                ->whereHas('notification.app.organization', fn($q) => $q->where('user_id', $user->id));
            DateFilter::apply($sendReportsQuery, $filter, $startDate, $endDate, 'created_at');

            $transactionalEmailLogsQuery = TransactionalLogDetection::with('appByUuid.organization')
                ->whereHas('appByUuid.organization', fn($q) => $q->where('user_id', $user->id))
                ->where('api_type', 'email');
            DateFilter::apply($transactionalEmailLogsQuery, $filter, $startDate, $endDate, 'created_at');

            $transactionalSmsLogsQuery = TransactionalLogDetection::with('appByUuid.organization')
                ->whereHas('appByUuid.organization', fn($q) => $q->where('user_id', $user->id))
                ->where('api_type', 'sms');
            DateFilter::apply($transactionalSmsLogsQuery, $filter, $startDate, $endDate, 'created_at');

            // Map collections
            $payments = $paymentsQuery->get()->map(fn($payment) => [
                'category'     => 'PAYMENT',
                'organization' => $payment->organization?->name ?? '-',
                'app'          => $payment->app?->name ?? '-',
                'activity'     => $payment->description ?? 'Payment processed',
                'status'       => ucfirst($payment->status ?? 'Success'),
                'created_at'   => $payment->created_at?->toIso8601String(),
                'date_time'    => $payment->created_at?->format('M d, Y h:i A'),
            ]);

            $emailCampaigns = $emailCampaignsQuery->get()->map(function ($campaign) {
                $statusLabel = match ((int) $campaign->status) {
                    0       => 'Failed',
                    1       => 'Completed',
                    2       => 'Scheduled',
                    3       => 'Active',
                    4       => 'Draft',
                    default => 'Unknown',
                };

                return [
                    'category'     => 'CAMPAIGN',
                    'organization' => $campaign->appByUuid?->organization?->name ?? '-',
                    'app'          => $campaign->appByUuid?->name ?? '-',
                    'activity'     => 'Email Campaign Triggered: "' . ($campaign->campaign_name ?? 'Untitled') . '"',
                    'status'       => $statusLabel,
                    'created_at'   => $campaign->updated_at?->toIso8601String() ?? $campaign->created_at?->toIso8601String(),
                    'date_time'    => $campaign->updated_at?->format('M d, Y h:i A') ?? $campaign->created_at?->format('M d, Y h:i A'),
                ];
            });

            $pushNotifications = $pushNotificationsQuery->get()->map(fn($push) => [
                'category'     => 'CAMPAIGN',
                'organization' => $push->app?->organization?->name ?? '-',
                'app'          => $push->app?->name ?? '-',
                'activity'     => 'Push Notification: "' . ($push->Title ?? 'Untitled') . '"',
                'status'       => ucfirst($push->status ?? 'Triggered'),
                'created_at'   => $push->updated_at?->toIso8601String() ?? $push->created_at?->toIso8601String(),
                'date_time'    => $push->updated_at?->format('M d, Y h:i A') ?? $push->created_at?->format('M d, Y h:i A'),
            ]);

            $mailboxes = $mailboxesQuery->get()->map(fn($mailbox) => [
                'category'     => 'MAILBOX',
                'organization' => $mailbox->app?->organization?->name ?? '-',
                'app'          => $mailbox->app?->name ?? '-',
                'activity'     => 'Mailbox Created: ' . $mailbox->email,
                'status'       => ucfirst($mailbox->status ?? 'Active'),
                'created_at'   => $mailbox->created_at?->toIso8601String(),
                'date_time'    => $mailbox->created_at?->format('M d, Y h:i A'),
            ]);

            $smsCampaigns = $smsCampaignsQuery->get()->map(fn($sms) => [
                'category'     => 'SMS',
                'organization' => $sms->appByUuid?->organization?->name ?? '-',
                'app'          => $sms->appByUuid?->name ?? '-',
                'activity'     => 'SMS Campaign: "' . ($sms->campaign_name ?? $sms->title ?? 'Untitled') . '"',
                'status'       => ucfirst($sms->status ?? 'Sent'),
                'created_at'   => $sms->created_at?->toIso8601String(),
                'date_time'    => $sms->created_at?->format('M d, Y h:i A'),
            ]);

            $sendReports = $sendReportsQuery->get()->map(fn($report) => [
                'category'     => 'WEB REPORT',
                'organization' => $report->notification?->app?->organization?->name ?? '-',
                'app'          => $report->notification?->app?->name ?? '-',
                'activity'     => 'Notification Report: ' . ($report->notification?->title ?? 'Report generated'),
                'status'       => ucfirst($report->status ?? 'Delivered'),
                'created_at'   => $report->created_at?->toIso8601String(),
                'date_time'    => $report->created_at?->format('M d, Y h:i A'),
            ]);

            $transactionalEmailLogs = $transactionalEmailLogsQuery->get()->map(fn($log) => [
                'category'     => 'TRANSACTIONAL EMAIL',
                'organization' => $log->appByUuid?->organization?->name ?? '-',
                'app'          => $log->appByUuid?->name ?? '-',
                'activity'     => 'Transactional ' . ucfirst($log->api_type ?? 'Email') . ': "' . ($log->subject ?? $log->msg_title ?? 'No Subject') . '"',
                'status'       => ucfirst($log->status ?? 'Success'),
                'created_at'   => $log->created_at?->toIso8601String(),
                'date_time'    => $log->created_at?->format('M d, Y h:i A'),
            ]);

            $transactionalSmsLogs = $transactionalSmsLogsQuery->get()->map(fn($log) => [
                'category'     => 'TRANSACTIONAL SMS',
                'organization' => $log->appByUuid?->organization?->name ?? '-',
                'app'          => $log->appByUuid?->name ?? '-',
                'activity'     => 'Transactional SMS: "' . ($log->msg_title ?? $log->subject ?? 'No Subject') . '"',
                'status'       => ucfirst($log->status ?? 'Success'),
                'created_at'   => $log->created_at?->toIso8601String(),
                'date_time'    => $log->created_at?->format('M d, Y h:i A'),
            ]);

            // Merge and Sort
            $sortedActivities = collect()
                ->concat($payments)
                ->concat($emailCampaigns)
                ->concat($pushNotifications)
                ->concat($mailboxes)
                ->concat($smsCampaigns)
                ->concat($sendReports)
                ->concat($transactionalEmailLogs)
                ->concat($transactionalSmsLogs)
                ->sortByDesc('created_at')
                ->values();

            if (!empty($search)) {
                $term = strtolower($search);
                $sortedActivities = $sortedActivities->filter(function ($item) use ($term) {
                    return str_contains(strtolower($item['category'] ?? ''), $term)
                        || str_contains(strtolower($item['organization'] ?? ''), $term)
                        || str_contains(strtolower($item['app'] ?? ''), $term)
                        || str_contains(strtolower($item['activity'] ?? ''), $term)
                        || str_contains(strtolower($item['status'] ?? ''), $term);
                });
            }

            $sortedActivities = $sortedActivities->sortByDesc('created_at')->values();

            $total = $sortedActivities->count();
            $activities = $sortedActivities->slice(($page - 1) * $perPage, $perPage)->values();

            $pagination = [
                'current_page' => $page,
                'per_page'     => $perPage,
                'last_page'    => (int) ceil($total / $perPage),
                'total'        => $total,
            ];
        } elseif ($tab === 'subscriptions') {
            $query = StripeSubscription::query()
                ->with(['organization', 'app'])
                ->where('user_id', $user->id);

            DateFilter::apply($query, $filter, $startDate, $endDate, 'created_at');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('subscription_name', 'like', "%{$search}%")
                        ->orWhere('stripe_status', 'like', "%{$search}%")
                        ->orWhereHas('organization', function ($orgQuery) use ($search) {
                            $orgQuery->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('app', function ($appQuery) use ($search) {
                            $appQuery->where('name', 'like', "%{$search}%");
                        });
                });
            }

            $subscriptions = $query
                ->orderBy('created_at', 'desc')
                ->paginate($perPage)
                ->withQueryString();

            $subscriptions->getCollection()->transform(function ($sub) {
                return [
                    'id'                   => $sub->id,
                    'user_id'              => $sub->user_id,
                    'organization_name'    => $sub->organization?->name,
                    'app_name'             => $sub->app?->name,
                    'subscription_name'    => $sub->subscription_name,
                    'stripe_status'        => $sub->stripe_status,
                    'amount'               => $sub->amount,
                    'currency'             => $sub->currency,
                    'payed_or_unpaid'      => $sub->payed_or_unpaid,
                    'current_period_start' => $sub->current_period_start?->format('g:i A, M j, Y'),
                    'ends_at'              => $sub->ends_at?->format('g:i A, M j, Y'),
                    'trial_ends_at'        => $sub->trial_ends_at?->format('g:i A, M j, Y'),
                    'start_date'           => $sub->start_date?->format('g:i A, M j, Y'),
                    'created_at'           => $sub->created_at?->format('g:i A, M j, Y'),
                    'updated_at'           => $sub->updated_at?->format('g:i A, M j, Y'),
                ];
            });
        }


        return Inertia::render('User/Show', [
            'user'          => $user,
            'activities'    => $activities,
            'organizations' => $organizations,
            'pagination'    => $pagination,
            'subscriptions' => $subscriptions,
            'filters'       => $request->only([
                'tab',
                'filter',
                'search',
                'start_date',
                'end_date',
                'page',
                'per_page',
            ]),
        ]);
    }
}
