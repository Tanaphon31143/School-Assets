<?php
namespace App\Notifications;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
class BorrowingStatusNotification extends Notification implements ShouldQueue { use Queueable; public function __construct(public int $borrowingId,public string $status,public string $message){} public function via(object $notifiable):array{return ['database','mail'];} public function toDatabase(object $notifiable):array{return ['borrowing_id'=>$this->borrowingId,'status'=>$this->status,'message'=>$this->message];} public function toMail(object $notifiable):MailMessage{return (new MailMessage)->subject('แจ้งเตือนระบบครุภัณฑ์')->line($this->message)->action('เปิดระบบ',url('/notifications'));} }
