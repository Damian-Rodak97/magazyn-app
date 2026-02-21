// Minimal wrapper for BlazorDB JS interop
using Microsoft.JSInterop;
using System.Threading.Tasks;
using System.Text.Json;

namespace MagazynApp.Data
{
    public class BlazorDbService
    {
        private readonly IJSRuntime _js;
        
        private class DbRecord
        {
            public int id { get; set; }
            public string? data { get; set; }
        }
        
        public BlazorDbService(IJSRuntime js)
        {
            _js = js;
        }

        public async Task PutGridAsync(int id, int rows, int columns, string data, string corridors, string taken)
        {
            await _js.InvokeVoidAsync("BlazorDB.Put", "GridStore", new { id, rows, columns, data, corridors, taken });
        }

        public async Task<JsonElement?> GetGridAsync(int id)
        {
            return await _js.InvokeAsync<JsonElement?>("BlazorDB.Get", "GridStore", id);
        }

        public async Task DeleteGridAsync(int id)
        {
            await _js.InvokeVoidAsync("BlazorDB.Delete", "GridStore", id);
        }
        
        public async Task PutWarehousesAsync(string json)
        {
            await _js.InvokeVoidAsync("BlazorDB.Put", "WarehouseStore", new { id = 1, data = json });
        }

        public async Task<string?> GetWarehousesAsync()
        {
            try
            {
                var result = await _js.InvokeAsync<DbRecord?>("BlazorDB.Get", "WarehouseStore", 1);
                return result?.data;
            }
            catch
            {
                return null;
            }
        }
    }
}
