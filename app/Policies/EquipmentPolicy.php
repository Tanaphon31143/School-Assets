<?php
namespace App\Policies;
use App\Models\Equipment;
use App\Models\User;
class EquipmentPolicy { public function viewAny(User $user):bool{return $user->hasAnyRole(['admin','teacher','student']);} public function view(User $user,Equipment $equipment):bool{return $this->viewAny($user);} public function create(User $user):bool{return $user->hasRole('admin');} public function update(User $user,Equipment $equipment):bool{return $user->hasRole('admin');} public function delete(User $user,Equipment $equipment):bool{return $user->hasRole('admin');} }
