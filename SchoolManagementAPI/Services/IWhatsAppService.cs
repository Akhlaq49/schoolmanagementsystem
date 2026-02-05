using SchoolManagementAPI.DTOs;

namespace SchoolManagementAPI.Services;

public interface IWhatsAppService
{
    Task<WhatsAppMessageResponse> SendMessageAsync(WhatsAppMessageRequest request);
    Task<WhatsAppMessageResponse> SendBulkMessageAsync(List<string> phoneNumbers, string message);
}
