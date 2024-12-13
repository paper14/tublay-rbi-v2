<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Record;
use Inertia\Inertia;
use Inertia\Response;

class NationalIDVerificationController extends Controller
{
    public function index(Request $request)
    {   
        Log::info('National ID Verification', [$request->method(), $request->ip(), Auth::user()]);
        return Inertia::render('NationalIDVerification', [
            'NID_PUBLIC_API_KEY' => env("NID_PUBLIC_API_KEY")
        ]);
    }

    public function validate(Request $request){
        Log::info('National ID Verificaiton - Validate', [$request->method(), $request->ip(), Auth::user()]);

        $authorizeResponse = Http::post('https://ws.everify.gov.ph/api/auth', [
            'client_id' => env("NID_CLIENT_ID"),
            'client_secret' => env("NID_CLIENT_SECRET")
        ]);

        if(json_decode($authorizeResponse)->data->access_token){
            $queryResponse = Http::withToken(json_decode($authorizeResponse)->data->access_token)->post('https://ws.everify.gov.ph/api/query',[
                "first_name" => $request->first_name,
                "middle_name" => $request->middle_name,
                "last_name" => $request->last_name,
                "suffix" => $request->suffix,
                "birth_date" =>  $request->birth_date,
                "face_liveness_session_id" => $request->face_liveness_session_id
            ]);
            return json_decode($queryResponse)->data;
        }  
    }
}
