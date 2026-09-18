<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Organization;
use App\Models\PaymentStatus;
use Illuminate\Support\Carbon;
use App\Models\StripeSubscription;
use App\Models\organization_capacities;

class OrganizationController extends Controller
{
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

        return Inertia::render('Organization/Index', [
            'organizations' => $organizations,
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

        $credits = organization_capacities::where(
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

        return Inertia::render('Organization/Show', [
            'organization' => $organization,
            'subscriptions' => $subscriptions,
            'payments' => $payments,
            'credits' => $credits
        ]);
    }
}
