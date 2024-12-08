<?php
 
namespace App\Http\Middleware;
 
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
 
class HandleLog
{
    public function handle(Request $request, Closure $next): Response
    {
        // Perform action
        Log::info('/', [$request->method(), $request->ip()]);
        return $next($request);
    }
}