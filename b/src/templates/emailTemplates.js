const emailTemplates = {
  registration: (name) => ({
    subject: 'Добро пожаловать в систему',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Добро пожаловать!</h2>
        <p>Здравствуйте${name ? `, ${name}` : ''}!</p>
        <p>Спасибо за регистрацию в нашей системе.</p>
        <p>Для начала работы вам нужно подтвердить ваш email.</p>
      </div>
    `,
  }),

  verifyEmail: (token) => ({
    subject: 'Подтверждение email адреса',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Подтверждение email</h2>
        <p>Для подтверждения вашего email адреса нажмите на кнопку ниже:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL}/verify-email/${token}" 
             style="background-color: #4CAF50; color: white; padding: 14px 20px; 
                    text-decoration: none; border-radius: 4px;">
            Подтвердить email
          </a>
        </div>
        <p>Если кнопка не работает, скопируйте эту ссылку в браузер:</p>
        <p>${process.env.APP_URL}/verify-email/${token}</p>
      </div>
    `,
  }),

  resetPassword: (token) => ({
    subject: 'Сброс пароля',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Сброс пароля</h2>
        <p>Вы запросили сброс пароля. Нажмите на кнопку ниже для создания нового пароля:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL}/reset-password/${token}" 
             style="background-color: #2196F3; color: white; padding: 14px 20px; 
                    text-decoration: none; border-radius: 4px;">
            Сбросить пароль
          </a>
        </div>
        <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
      </div>
    `,
  }),

  companyCreated: (companyName) => ({
    subject: `Компания "${companyName}" создается`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Создание компании</h2>
        <p>Ваша компания "${companyName}" создается в системе.</p>
        <p>Этот процесс займет около 5 минут.</p>
        <p>Как только всё будет готово, мы отправим вам уведомление.</p>
      </div>
    `,
  }),

  companyReady: (companyName) => ({
    subject: `Компания "${companyName}" готова к работе`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Компания готова!</h2>
        <p>Ваша компания "${companyName}" успешно создана и готова к работе.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL}/company/dashboard" 
             style="background-color: #4CAF50; color: white; padding: 14px 20px; 
                    text-decoration: none; border-radius: 4px;">
            Перейти в кабинет компании
          </a>
        </div>
      </div>
    `,
  }),
};

module.exports = emailTemplates;
