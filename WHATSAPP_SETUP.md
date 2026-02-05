# WhatsApp Notification System Setup

This document explains how to set up and configure the WhatsApp notification system for sending messages to parents using Twilio WhatsApp API.

## Features

- Send WhatsApp messages to individual or multiple parents
- Filter parents by class
- Optional message title
- Bulk messaging support
- Success/failure tracking
- Uses Twilio C# SDK for reliable message delivery

## Configuration

### Twilio WhatsApp API Setup

1. **Sign up for Twilio Account**
   - Go to https://www.twilio.com
   - Create a free account or sign in

2. **Get Your Account Credentials**
   - Go to Twilio Console: https://console.twilio.com
   - Copy your **Account SID** from the dashboard (e.g., AC24fb898563ec6b73d19dd3a906e635c6)
   - Copy your **Auth Token** from the dashboard (click to reveal)

3. **Get WhatsApp-Enabled Phone Number**
   - Go to Phone Numbers > Manage > Buy a number
   - Or use Twilio's Sandbox WhatsApp number: `+14155238886` (for testing)
   - For production, purchase a WhatsApp-enabled number

4. **Set up Content Templates (Optional)**
   - Go to Content > Templates in Twilio Console
   - Create message templates if you want to use template messages
   - Copy the Content SID for your template (e.g., HXb5b62575e6e4ff6129ad7c8efe1f983e)

5. **Add Configuration to `appsettings.json`:**

```json
{
  "WhatsApp": {
    "AccountSid": "YOUR_TWILIO_ACCOUNT_SID",
    "AuthToken": "YOUR_TWILIO_AUTH_TOKEN",
    "FromNumber": "whatsapp:+14155238886",
    "ContentSid": "YOUR_CONTENT_SID_FOR_TEMPLATES",
    "DefaultCountryCode": "92"
  }
}
```

**Note:** Replace:
- `YOUR_TWILIO_ACCOUNT_SID` with your Twilio Account SID
- `YOUR_TWILIO_AUTH_TOKEN` with your Twilio Auth Token
- `whatsapp:+14155238886` with your Twilio WhatsApp number (or sandbox number)
- `YOUR_CONTENT_SID_FOR_TEMPLATES` with your Content SID if using templates (optional, leave empty for text messages)
- `92` with your default country code (Pakistan in example, change as needed)

### Important Notes

- **Twilio Sandbox:**
  - For testing, you can use Twilio's WhatsApp Sandbox: `+14155238886`
  - Users need to send a message to the sandbox number first to join
  - Format: Send "join [your-code]" to the sandbox number
  - Get your join code from Twilio Console > Messaging > Try it out > Send a WhatsApp message

- **Phone Number Format:**
  - Phone numbers are automatically formatted with country code
  - Format: +[CountryCode][Number] (e.g., +923012805749)
  - Numbers starting with 0 will have the 0 removed
  - Default country code will be prepended if not present

- **Message Types:**
  - **Text Messages**: Uses `Body` property (works within 24-hour conversation window)
  - **Template Messages**: Uses `ContentSid` property (for messages outside 24-hour window)
  - If `ContentSid` is configured, template messages will be used; otherwise, text messages are sent

- **Rate Limits:**
  - Twilio has rate limits based on your account type
  - Check your limits in Twilio Console
  - Free accounts have lower limits than paid accounts

## Usage

### For Administrators and Teachers

1. Navigate to **WhatsApp Notifications** from the menu
2. Optionally enter a title for your message
3. Filter parents by class (optional) or select "All Parents"
4. Select the parents you want to send the message to
5. Enter your message
6. Click "Send via WhatsApp"

### Phone Number Format

- Phone numbers are automatically formatted with country code
- Numbers starting with 0 will have the 0 removed
- Default country code will be prepended if not present
- Format: +[CountryCode][PhoneNumber] (e.g., +923012805749)

## API Endpoints

### Send Message
```
POST /api/WhatsApp/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "phoneNumbers": ["+923012805749", "+923456789012"],
  "message": "Your message here",
  "title": "Optional Title"
}
```

### Get All Parents
```
GET /api/WhatsApp/parents
Authorization: Bearer {token}
```

### Get Parents by Class
```
GET /api/WhatsApp/parents/by-class/{classId}
Authorization: Bearer {token}
```

## Security

- Only users with `admin` or `teacher` roles can send WhatsApp messages
- All endpoints require JWT authentication
- Phone numbers are validated before sending

## Troubleshooting

### Messages Not Sending

1. Check your Twilio configuration in `appsettings.json`
2. Verify your Account SID and Auth Token are correct
3. Ensure phone numbers are in the correct format
4. Check application logs for detailed error messages
5. Verify you have sufficient balance in your Twilio account

### Phone Number Format Issues

- Ensure parent phone numbers are stored correctly in the database
- Phone numbers should include country code
- Invalid phone numbers will be skipped and reported in the response

### Twilio Sandbox Issues

- For sandbox testing, users must first send "join [code]" to the sandbox number
- Get your join code from Twilio Console
- Only numbers that have joined the sandbox can receive messages

## Notes

- The system uses **Twilio WhatsApp API** with the Twilio C# SDK
- Messages are sent synchronously - for large batches, consider implementing a queue system
- Failed messages are tracked and reported in the response
- All messages must comply with WhatsApp's Business Policy and Terms of Service
- For production use, implement message templates for messages outside the 24-hour window

## Troubleshooting Twilio WhatsApp API

### Common Issues

1. **Authentication Failed**
   - Verify your Account SID and Auth Token are correct
   - Check that credentials are properly set in appsettings.json
   - Ensure no extra spaces in configuration values

2. **Invalid Phone Number**
   - Ensure phone numbers are in international format (+CountryCodeNumber)
   - Verify the phone number is registered on WhatsApp
   - For sandbox, ensure users have joined by sending "join [code]" to sandbox number

3. **Rate Limit Exceeded**
   - Check your rate limits in Twilio Console
   - Implement rate limiting or queue system for bulk messages
   - Upgrade your Twilio account for higher limits

4. **Message Not Sent**
   - Check Twilio Console logs for detailed error messages
   - Verify your WhatsApp number is properly configured
   - Ensure you have sufficient balance in your Twilio account
   - Check message status in Twilio Console > Monitor > Logs

### Testing

- Use Twilio's Sandbox WhatsApp number for testing: `+14155238886`
- Test with a single phone number first before bulk sending
- Check Twilio Console > Monitor > Logs for message status
- Verify message delivery status in the response
