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

        if ($request->has('draw')) {

            $recordsTotal = User::count();

            $search = $request->input('search.value');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orwhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('id', 'like', "%{$search}%");
                });
            }

            $recordsFiltered = $query->count();

            $columns = [
                0 => 'id',
                1 => 'first_name',
                2 => 'last_name',
                3 => 'email',
                4 => 'phone',
                5 => 'created_at',
            ];

            $orderColumn = $request->input('order.0.column');
            $orderDirection = $request->input('order.0.dir', 'desc');

            if (isset($columns[$orderColumn])) {
                $query->orderBy(
                    $columns[$orderColumn],
                    $orderDirection === 'asc' ? 'asc' : 'desc'
                );
            } else {
                $query->orderBy('created_at', 'desc');
            }

            $start = (int) $request->input('start', 0);
            $length = (int) $request->input('length', 10);

            $users = $query
                ->skip($start)
                ->take($length)
                ->get();

            $users->transform(function ($user) {
                $user->date = $user->created_at->format('d M Y');
                $user->time = $user->created_at->format('h:i A');

                return $user;
            });

            return response()->json([
                'draw' => (int) $request->input('draw'),
                'recordsTotal' => $recordsTotal,
                'recordsFiltered' => $recordsFiltered,
                'data' => $users,
            ]);
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
