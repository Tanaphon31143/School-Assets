<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class BackupDatabase extends Command
{
    protected $signature = 'database:backup';

    protected $description = 'Export the current MySQL database to a timestamped SQL file';

    public function handle(): int
    {
        $dir = storage_path('app/backups');
        File::ensureDirectoryExists($dir);

        $file = $dir.'/durable-'.now()->format('Ymd-His').'.sql';
        $temporaryFile = $file.'.tmp';
        $db = config('database.connections.mysql');
        $dumpBinary = env('MYSQLDUMP_PATH') ?: 'C:\\xampp\\mysql\\bin\\mysqldump.exe';

        if (! File::exists($dumpBinary) && ! $this->binaryIsAvailable('mysqldump')) {
            $this->error('ไม่พบ mysqldump กรุณาตั้งค่า MYSQLDUMP_PATH ในไฟล์ .env');

            return self::FAILURE;
        }

        $command = sprintf(
            '%s --host=%s --port=%s --user=%s %s %s',
            escapeshellarg(File::exists($dumpBinary) ? $dumpBinary : 'mysqldump'),
            escapeshellarg($db['host']),
            escapeshellarg($db['port']),
            escapeshellarg($db['username']),
            $db['password'] !== '' ? '--password='.escapeshellarg($db['password']) : '',
            escapeshellarg($db['database'])
        );

        $output = [];
        $code = 0;
        exec($command.' > '.escapeshellarg($temporaryFile), $output, $code);

        if ($code !== 0 || ! File::exists($temporaryFile) || File::size($temporaryFile) === 0) {
            File::delete($temporaryFile);
            $this->error('สำรองฐานข้อมูลไม่สำเร็จ');

            return self::FAILURE;
        }

        File::move($temporaryFile, $file);
        $this->info("Backup created: {$file}");

        return self::SUCCESS;
    }

    private function binaryIsAvailable(string $binary): bool
    {
        exec('where '.$binary, $output, $code);

        return $code === 0;
    }
}
