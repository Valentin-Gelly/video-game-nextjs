import * as React from 'react';

interface EmailTemplateProps {
  firstName: string;
}

export function EmailTemplate(token: string) {
  const verifyUrl = `${process.env.APP_URL}/register/verify?token=${token}`;
  
    const html = `
    <div style="font-family: sans-serif; text-align: center;">
      <h2>Confirmez votre adresse e-mail</h2>
      <p>Merci de vous être inscrit ! Cliquez sur le bouton ci-dessous pour confirmer votre compte :</p>
      <a href="${verifyUrl}" 
         style="display: inline-block; background: #2563eb; color: white; 
                padding: 10px 20px; border-radius: 8px; text-decoration: none;">
        Confirmer mon e-mail
      </a>
      <p style="margin-top: 16px; font-size: 12px; color: #666;">
        Si vous n’avez pas créé de compte, ignorez ce message.
      </p>
    </div>
  `;
    return (html);
}