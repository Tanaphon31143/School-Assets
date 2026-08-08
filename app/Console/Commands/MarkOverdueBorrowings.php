<?php

namespace App\Console\Commands;
use App\Models\EquipmentBorrowing;
use App\Notifications\BorrowingStatusNotification;
use Illuminate\Support\Carbon;

use Illuminate\Console\Command;

class MarkOverdueBorrowings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'borrowings:mark-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle(){ $items=EquipmentBorrowing::with('borrower')->whereIn('status',['approved','borrowed'])->whereDate('expected_return_date','<',Carbon::today())->get(); foreach($items as $item){$item->update(['status'=>'overdue']);$item->borrower->notify(new BorrowingStatusNotification($item->id,'overdue','ครุภัณฑ์เกินกำหนดคืนแล้ว'));} $this->info("Marked {$items->count()} borrowing(s) overdue."); return self::SUCCESS; }
}
