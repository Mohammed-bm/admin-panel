<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;


class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        $search = $request->input('search');
        $filter = $request->input('filter');

        if ($filter) {
            if ($filter === 'today') {
                $query->whereDate('created_at', Carbon::today());
            } elseif ($filter === 'last-7-days') {
                $query->where('created_at', '>=', Carbon::now()->subDays(7)->startOfDay());
            } elseif ($filter === 'last-30-days') {
                $query->where('created_at', '>=', Carbon::now()->subDays(30)->startOfDay());
            } elseif ($filter === 'last-15-days') {
                $query->where('created_at', '>=', Carbon::now()->subDays(15)->startOfDay());
            } elseif ($filter === 'last-year') {
                $query->where('created_at', '>=', Carbon::now()->subDays(365)->startOfDay());
            } elseif (str_starts_with($filter, 'custom:')) {
                $parts = explode(':', $filter);
                if (count($parts) === 3) {
                    
                    $start = min($parts[1], $parts[2]);
                    $end   = max($parts[1], $parts[2]);

                    $query->whereBetween('created_at', [
                        Carbon::parse($start)->startOfDay(),
                        Carbon::parse($end)->endOfDay()
                    ]);
                }
            }
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orwhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%");
            });
        }

        $users = $query->orderby('created_at', 'desc')->paginate(10)->withQueryString();

        $users->getCollection()->transform(function ($user) {
            $user->date = $user->created_at->format('d M Y');
            $user->time = $user->created_at->format('h:i A');

            return $user;
        });

        return Inertia::render('User/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'filter']),
        ]);
    }
}
