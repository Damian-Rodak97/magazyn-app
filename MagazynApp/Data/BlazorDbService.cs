// Firebase Firestore wrapper for Blazor
using Microsoft.JSInterop;
using System.Threading.Tasks;
using System.Text.Json;

namespace MagazynApp.Data
{
    public class BlazorDbService
    {
        private readonly IJSRuntime _js;
        
        private class FirebaseResult
        {
            public bool success { get; set; }
            public string? error { get; set; }
            public string? data { get; set; }
        }
        
        public BlazorDbService(IJSRuntime js)
        {
            _js = js;
        }

        // Save all warehouses to Firestore
        public async Task PutWarehousesAsync(string json)
        {
            try
            {
                var result = await _js.InvokeAsync<FirebaseResult>("firebaseDb.saveWarehouses", json);
                if (!result.success)
                {
                    Console.WriteLine($"Firebase save error: {result.error}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Firebase save exception: {ex.Message}");
            }
        }

        // Load all warehouses from Firestore
        public async Task<string?> GetWarehousesAsync()
        {
            try
            {
                var result = await _js.InvokeAsync<FirebaseResult>("firebaseDb.loadWarehouses");
                if (result.success)
                {
                    return result.data;
                }
                else
                {
                    Console.WriteLine($"Firebase load error: {result.error}");
                    return null;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Firebase load exception: {ex.Message}");
                return null;
            }
        }

        // Kept for backwards compatibility (not used with Firebase)
        public async Task PutGridAsync(int id, int rows, int columns, string data, string corridors, string taken)
        {
            // This method is deprecated with Firebase - use PutWarehousesAsync instead
            await Task.CompletedTask;
        }

        public async Task<JsonElement?> GetGridAsync(int id)
        {
            // This method is deprecated with Firebase - use GetWarehousesAsync instead
            return await Task.FromResult<JsonElement?>(null);
        }

        public async Task DeleteGridAsync(int id)
        {
            // This method is deprecated with Firebase - use PutWarehousesAsync instead
            await Task.CompletedTask;
        }
    }
}
