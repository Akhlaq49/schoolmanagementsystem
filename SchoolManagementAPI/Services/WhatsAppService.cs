using SchoolManagementAPI.DTOs;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace SchoolManagementAPI.Services;

public class WhatsAppService : IWhatsAppService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<WhatsAppService> _logger;
    private bool _twilioInitialized = false;

    public WhatsAppService(IConfiguration configuration, ILogger<WhatsAppService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        InitializeTwilio();
    }

    private void InitializeTwilio()
    {
        try
        {
            var accountSid = _configuration["WhatsApp:AccountSid"];
            var authToken = _configuration["WhatsApp:AuthToken"];

            if (!string.IsNullOrEmpty(accountSid) && !string.IsNullOrEmpty(authToken))
            {
                TwilioClient.Init(accountSid, authToken);
                _twilioInitialized = true;
                _logger.LogInformation("Twilio client initialized successfully");
            }
            else
            {
                _logger.LogWarning("Twilio AccountSid or AuthToken is missing");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize Twilio client");
        }
    }

    public async Task<WhatsAppMessageResponse> SendMessageAsync(WhatsAppMessageRequest request)
    {
        var response = new WhatsAppMessageResponse
        {
            Success = false,
            SentCount = 0,
            FailedCount = 0,
            FailedNumbers = new List<string>()
        };

        try
        {
            if (!_twilioInitialized)
            {
                response.Message = "Twilio is not configured. Please configure AccountSid and AuthToken in appsettings.json";
                return response;
            }

            var fromNumber = _configuration["WhatsApp:FromNumber"] ?? "whatsapp:+14155238886";
            var contentSid = _configuration["WhatsApp:ContentSid"]; // Optional: for template messages

            // Format message with title if provided
            var messageText = string.IsNullOrEmpty(request.Title)
                ? request.Message
                : $"*{request.Title}*\n\n{request.Message}";

            // Send to each phone number
            foreach (var phoneNumber in request.PhoneNumbers)
            {
                try
                {
                    var formattedNumber = FormatPhoneNumber(phoneNumber);
                    if (string.IsNullOrEmpty(formattedNumber))
                    {
                        response.FailedCount++;
                        response.FailedNumbers.Add(phoneNumber);
                        continue;
                    }

                    var messageOptions = new CreateMessageOptions(
                        new PhoneNumber($"whatsapp:+{formattedNumber}"));
                    messageOptions.From = new PhoneNumber(fromNumber);

                    // If contentSid is configured, use template message
                    if (!string.IsNullOrEmpty(contentSid))
                    {
                        messageOptions.ContentSid = contentSid;
                        // If variables are needed, you can add them here
                        // messageOptions.ContentVariables = "{\"1\":\"value1\",\"2\":\"value2\"}";
                    }
                    else
                    {
                        // Use regular text message
                        messageOptions.Body = messageText;
                    }

                    var message = await MessageResource.CreateAsync(messageOptions);
                    
                    if (message.Status != null && (message.Status == MessageResource.StatusEnum.Queued || 
                        message.Status == MessageResource.StatusEnum.Sending || 
                        message.Status == MessageResource.StatusEnum.Sent))
                    {
                        response.SentCount++;
                        _logger.LogInformation($"Successfully sent WhatsApp message to {formattedNumber}. Status: {message.Status}");
                    }
                    else
                    {
                        response.FailedCount++;
                        response.FailedNumbers.Add(phoneNumber);
                        _logger.LogWarning($"WhatsApp message to {phoneNumber} has status: {message.Status}");
                    }
                }
                catch (Exception ex)
                {
                    response.FailedCount++;
                    response.FailedNumbers.Add(phoneNumber);
                    _logger.LogError(ex, $"Error sending WhatsApp message to {phoneNumber}");
                }
            }

            response.Success = response.SentCount > 0;
            response.Message = response.SentCount > 0
                ? $"Successfully sent {response.SentCount} message(s)."
                : "Failed to send messages.";

            if (response.FailedCount > 0)
            {
                response.Message += $" {response.FailedCount} message(s) failed.";
            }

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in SendMessageAsync");
            response.Message = $"Error: {ex.Message}";
            return response;
        }
    }

    public async Task<WhatsAppMessageResponse> SendBulkMessageAsync(List<string> phoneNumbers, string message)
    {
        var request = new WhatsAppMessageRequest
        {
            PhoneNumbers = phoneNumbers,
            Message = message
        };
        return await SendMessageAsync(request);
    }

    private string? FormatPhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return null;

        var cleaned = phoneNumber.Trim();
        string digitsOnly;

        // If it already starts with +, extract digits
        if (cleaned.StartsWith("+"))
        {
            digitsOnly = new string(cleaned.Where(char.IsDigit).ToArray());
        }
        else
        {
            // Remove all non-digit characters
            digitsOnly = new string(cleaned.Where(char.IsDigit).ToArray());
        }

        // If number starts with 0, remove it
        if (digitsOnly.StartsWith("0"))
        {
            digitsOnly = digitsOnly.Substring(1);
        }

        // If number doesn't start with country code, add default
        var defaultCountryCode = _configuration["WhatsApp:DefaultCountryCode"] ?? "92";
        if (!digitsOnly.StartsWith(defaultCountryCode))
        {
            digitsOnly = defaultCountryCode + digitsOnly;
        }

        return digitsOnly;
    }
}
