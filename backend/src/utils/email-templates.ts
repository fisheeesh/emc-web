const dashboardLink = `${process.env.DASHBOARD_URL}/dashboard/sentiments`

export const critical_subject = (empName: string) => `🚨 Wellness Alert: ${empName} May Need Support`;

export const critical_body = (empName: string) => `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        margin: 0;
                        padding: 0;
                        background-color: #f5f5f5;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    .header {
                        background-color: #dc2626;
                        color: white;
                        padding: 30px 20px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: 600;
                    }
                    .content {
                        padding: 30px;
                    }
                    .alert-box {
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 16px;
                        margin: 24px 0;
                        border-radius: 4px;
                    }
                    .alert-box p {
                        margin: 4px 0;
                        line-height: 1.8;
                    }
                    .employee-name {
                        color: #dc2626;
                        font-weight: bold;
                        font-size: 18px;
                    }
                    .action-box {
                        background-color: #e7f3ff;
                        border-left: 4px solid #2196F3;
                        padding: 20px;
                        margin: 24px 0;
                        border-radius: 4px;
                    }
                    .action-box h3 {
                        margin: 0 0 12px 0;
                        font-size: 18px;
                        color: #1976d2;
                    }
                    .action-box ol {
                        margin: 12px 0;
                        padding-left: 20px;
                    }
                    .action-box li {
                        margin: 10px 0;
                        line-height: 1.6;
                    }
                    .dashboard-button {
                        display: inline-block;
                        background-color: #2196F3;
                        color: white;
                        padding: 14px 28px;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: 600;
                        margin: 20px 0;
                        text-align: center;
                    }
                    .dashboard-button:hover {
                        background-color: #1976d2;
                    }
                    .button-container {
                        text-align: center;
                        margin: 24px 0;
                    }
                    .important-note {
                        background-color: #ffebee;
                        border-left: 4px solid #f44336;
                        padding: 16px;
                        margin: 24px 0;
                        border-radius: 4px;
                    }
                    .footer {
                        background-color: #f9f9f9;
                        text-align: center;
                        padding: 20px;
                        font-size: 12px;
                        color: #666;
                        border-top: 1px solid #e0e0e0;
                    }
                    .footer p {
                        margin: 8px 0;
                    }
                    p {
                        margin: 16px 0;
                        line-height: 1.6;
                    }
                    strong {
                        color: #333;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚨 Employee Wellness Alert</h1>
                    </div>
                    
                    <div class="content">
                        <p>Dear HR Team,</p>
                        
                        <div class="alert-box">
                            <p><strong>Employee:</strong> <span class="employee-name">${empName}</span></p>
                            <p><strong>Status:</strong> Critical mood indicators detected</p>
                            <p><strong>Action Required:</strong> Immediate attention recommended</p>
                        </div>

                        <p>
                            Our wellness monitoring system has identified that <strong>${empName}</strong> 
                            may be experiencing significant emotional distress based on recent mood check-ins.
                        </p>

                        <div class="action-box">
                            <h3>📋 Recommended Actions</h3>
                            <ol>
                                <li>
                                    <strong>Review AI Analysis:</strong> Access the sentiment dashboard to view detailed 
                                    AI-generated insights about ${empName}'s emotional patterns, triggers, and recommendations.
                                </li>
                                <li>
                                    <strong>Schedule a Check-In:</strong> Arrange a private, confidential one-on-one 
                                    meeting within the next 24-48 hours to discuss their wellbeing.
                                </li>
                                <li>
                                    <strong>Take Action Based on Analysis:</strong> After reviewing the AI insights, 
                                    consider appropriate interventions such as:
                                    <ul style="margin-top: 8px;">
                                        <li>Adjusting workload or redistributing tasks</li>
                                        <li>Offering flexible work arrangements or time off</li>
                                        <li>Providing mental health resources and support contacts</li>
                                        <li>Connecting them with Employee Assistance Program (EAP)</li>
                                    </ul>
                                </li>
                                <li>
                                    <strong>Follow Up:</strong> Schedule a follow-up check-in within 24-48 hours to 
                                    ensure the employee feels supported and improvements are being made.
                                </li>
                            </ol>
                        </div>

                        <div class="button-container">
                            <a href="${dashboardLink}" class="dashboard-button">
                                📊 View AI Analysis & Sentiment Dashboard
                            </a>
                        </div>

                        <div class="important-note">
                            <p style="margin: 0;">
                                <strong>🚨 Important:</strong> Please approach this situation with sensitivity, empathy, 
                                and complete confidentiality. The employee's wellbeing and privacy are paramount. 
                                All information should be handled in accordance with company privacy policies and 
                                employment regulations.
                            </p>
                        </div>

                        <p>
                            <strong>Emergency Protocol:</strong> If you believe there is an immediate safety concern 
                            or risk of harm, please contact emergency services or your organization's crisis 
                            intervention resources immediately. Do not delay.
                        </p>

                        <p style="margin-top: 30px;">
                            Best regards,<br>
                            <strong>Employee Wellness Monitoring System</strong>
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p><strong>🔒 Confidential Alert</strong></p>
                        <p>This is an automated alert. Please treat this information as strictly confidential.</p>
                        <p>For support resources or technical assistance, contact your HR department.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

export const normal_subject = () => '✅ Employee Wellness Stable'

export const normal_body = (empName: string) => `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
                background: linear-gradient(135deg, #4caf50 0%, #81c784 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }
            .content {
                padding: 30px;
            }
            .success-box {
                background: linear-gradient(135deg, #66bb6a 0%, #81c784 100%);
                color: white;
                padding: 20px;
                margin: 24px 0;
                border-radius: 8px;
                text-align: center;
            }
            .success-box h2 {
                margin: 0 0 8px 0;
                font-size: 22px;
            }
            .success-box p {
                margin: 4px 0;
                font-size: 16px;
                opacity: 0.95;
            }
            .info-box {
                background-color: #e8f5e9;
                border-left: 4px solid #4caf50;
                padding: 20px;
                margin: 24px 0;
                border-radius: 4px;
            }
            .info-box h3 {
                margin: 0 0 12px 0;
                font-size: 18px;
                color: #2e7d32;
            }
            .info-box ul {
                margin: 12px 0;
                padding-left: 20px;
            }
            .info-box li {
                margin: 8px 0;
                line-height: 1.6;
            }
            .celebration-emoji {
                font-size: 48px;
                text-align: center;
                margin: 20px 0;
            }
            .footer {
                background-color: #f9f9f9;
                text-align: center;
                padding: 20px;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #e0e0e0;
            }
            .footer p {
                margin: 8px 0;
            }
            p {
                margin: 16px 0;
                line-height: 1.6;
            }
            strong {
                color: #333;
            }
            .employee-name {
                color: #4caf50;
                font-weight: bold;
                font-size: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌟 Wellness Update: Positive Progress</h1>
            </div>
            
            <div class="content">
                <p>Dear HR Team,</p>

                <div class="celebration-emoji">
                    🎉 ✨ 💚
                </div>
                
                <div class="success-box">
                    <h2>Great News!</h2>
                    <p><span class="employee-name">${empName}</span>'s mental wellness indicators have stabilized</p>
                </div>

                <p>
                    We're pleased to inform you that <strong>${empName}</strong>'s recent mood check-ins 
                    show significant improvement and stability. Our AI-powered wellness monitoring system 
                    has detected consistent positive patterns, indicating a healthy emotional state.
                </p>

                <div class="info-box">
                    <h3>📊 Key Observations</h3>
                    <ul>
                        <li>Mood scores have returned to healthy baseline levels</li>
                        <li>Sentiment patterns show consistent stability</li>
                        <li>No concerning indicators detected in recent check-ins</li>
                        <li>Emotional wellbeing appears balanced and sustainable</li>
                    </ul>
                </div>

                <p>
                    Thank you for your ongoing commitment to employee wellbeing. Your support plays 
                    a crucial role in fostering a healthy, thriving workplace culture.
                </p>

                <p style="margin-top: 30px;">
                    Warm regards,<br>
                    <strong>Employee Wellness Monitoring System</strong>
                </p>
            </div>
            
            <div class="footer">
                <p><strong>🌱 Wellness Monitoring System</strong></p>
                <p>This is an automated positive update from your employee wellness monitoring system.</p>
                <p>Continue supporting mental health awareness in your workplace.</p>
            </div>
        </div>
    </body>
    </html>
`