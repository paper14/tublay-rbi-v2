<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Record extends Model
{
    protected $fillable = [
        'barangay',
        'sitio',
        'house_number',
        'household_number',
        'name_of_hh_head',
        'last_name',
        'first_name',
        'middle_name',
        'extension',
        'citizenship',
        'nationality',
        'relationship_to_hh_head',
        'gender',
        'civil_status',
        'place_of_birth',
        'pob_province',
        'pob_country',
        'date_of_birth',
        'registered_voter',
        'birth_registration',
        'marriage_registration',
        'religion',
        'ethnic_group',
        'occupation',
        'educational_attainment',
        'skills',
        'persons_with_disablitities',
        'variation',
        'date_of_birth',
        'place_of_death',
        'cause_of_death',
        'reason_of_outmigration',
        'electricity',
        'pension',
        'sanitation',
        'drrm_skills',
        'house_construction_materials'
    ];

    protected $table = 'records';
    protected $primaryKey = 'person_id';
}
