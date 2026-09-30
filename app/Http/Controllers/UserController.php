<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Support\Filters\DateFilter;
use App\Support\Filters\SearchFilter;

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
}
