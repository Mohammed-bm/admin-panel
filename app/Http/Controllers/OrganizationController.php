<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Organization;
use Illuminate\Support\Carbon;
use App\Models\StripeSubscription;

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
            $org->date = $org->created_at ? $org->created_at->format('d M Y') : null;
            $org->time = $org->created_at ? $org->created_at->format('h:i A') : null;

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
        )->get()
            ->map(function ($subscription) {
                $subscription->trial_ends_at = $subscription->trial_ends_at
                    ? Carbon::parse($subscription->trial_ends_at)->format('M j, Y')
                    : null;

                $subscription->ends_at = $subscription->ends_at
                    ? Carbon::parse($subscription->ends_at)->format('M j, Y')
                    : null;

                $subscription->created_date = $subscription->created_at
                    ? $subscription->created_at->format('M j, Y')
                    : null;

                $subscription->updated_date = $subscription->updated_at
                    ? $subscription->updated_at->format('M j, Y')
                    : null;

                return $subscription;
            });

        return Inertia::render('Organization/Show', [
            'organization' => $organization,
            'subscriptions' => $subscriptions,
        ]);
    }
}
