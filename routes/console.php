<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::command('borrowings:mark-overdue')->daily();
Schedule::command('database:backup')
    ->dailyAt('23:30')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/backup.log'));

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
