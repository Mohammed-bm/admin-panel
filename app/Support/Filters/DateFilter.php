<?php

namespace App\Support\Filters;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class DateFilter
{
    public static function apply(
        Builder $query,
        ?string $filter,
        ?string $startDate = null,
        ?string $endDate = null,
        string $dateColumn = 'created_at'
    ): Builder {
        if (!$filter) {
            return $query;
        }

        switch ($filter) {
            case 'today':
                $query->whereDate(
                    $dateColumn,
                    Carbon::today()
                );
                break;

            case 'last-7-days':
                $query->where(
                    $dateColumn,
                    '>=',
                    Carbon::now()->subDays(7)->startOfDay()
                );
                break;

            case 'last-15-days':
                $query->where(
                    $dateColumn,
                    '>=',
                    Carbon::now()->subDays(15)->startOfDay()
                );
                break;

            case 'last-30-days':
                $query->where(
                    $dateColumn,
                    '>=',
                    Carbon::now()->subDays(30)->startOfDay()
                );
                break;

            case 'last-year':
                $query->where(
                    $dateColumn,
                    '>=',
                    Carbon::now()->subYear()->startOfDay()
                );
                break;

            case 'custom':
                if ($startDate && $endDate) {
                    $start = Carbon::parse($startDate)->startOfDay();
                    $end = Carbon::parse($endDate)->endOfDay();

                    // Make sure the dates work even if
                    // the user selects them in reverse order.
                    if ($start->gt($end)) {
                        [$start, $end] = [$end, $start];
                    }

                    $query->whereBetween(
                        $dateColumn,
                        [$start, $end]
                    );
                }
                break;
        }

        return $query;
    }
}