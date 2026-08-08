<?php
namespace App\Policies;
use App\Models\EquipmentBorrowing;
use App\Models\User;
class EquipmentBorrowingPolicy { public function viewAny(User $user):bool{return $user->hasAnyRole(['admin','teacher','student']);} public function view(User $user,EquipmentBorrowing $borrowing):bool{return $user->hasAnyRole(['admin','teacher'])||$borrowing->user_id===$user->id;} public function approve(User $user,EquipmentBorrowing $borrowing):bool{return $user->hasAnyRole(['admin','teacher'])&&$borrowing->status==='pending';} public function return(User $user,EquipmentBorrowing $borrowing):bool{return $user->hasRole('admin')||$borrowing->user_id===$user->id;} }
