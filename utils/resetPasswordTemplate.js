const resetPasswordEmailTemplate = (resetLink) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f8f8; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #ffffff; }
        .button { display: inline-block; padding: 10px 20px; background-color: #C9080E; color: #ffffff; text-decoration: none; border-radius: 5px; }
        .footer { margin-top: 20px; text-align: center; font-size: 0.8em; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #C9080E; margin: 0;">BlokeCore</h1>
        </div>
        <div class="content">
            <h2>Reset Your Password</h2>
            <p>Hi there, let's reset your password.</p>
            <p style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Your Password</a>
            </p>
            <p>If the above button does not work for you, copy and paste the following into your browser's address bar:</p>
            <p style="word-break: break-all; color: #0000EE;">${resetLink}</p>
            <p style="font-size: 0.9em; color: #666;">If you didn't ask to reset your password, you can disregard this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 BlokeCore. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export default resetPasswordEmailTemplate;

