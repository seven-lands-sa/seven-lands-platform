const key = 'gmk_live__ZkhppflBwxJrB9rM8fPTtwgtkmpb3l6YrnkcpCJ84g';

async function main() {
  console.log('Testing GhostMind /v1/models ...');
  try {
    const resModels = await fetch('https://ghostmind.optdmsa.com/v1/models', {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    console.log('Models HTTP Status:', resModels.status);
    const bodyModels = await resModels.text();
    console.log('Models Response:', bodyModels);
  } catch (err) {
    console.error('Error fetching models:', err);
  }

  console.log('\nTesting GhostMind /v1/chat/completions ...');
  try {
    const resChat = await fetch('https://ghostmind.optdmsa.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'auto',
        messages: [
          { role: 'system', content: 'أنت مساعد ذكي مرح يمثل شركة سفن لاند السعودية.' },
          { role: 'user', content: 'هلا والله، وش تقدمون من خدمات؟' }
        ]
      })
    });
    console.log('Chat HTTP Status:', resChat.status);
    const bodyChat = await resChat.text();
    console.log('Chat Response:', bodyChat);
  } catch (err) {
    console.error('Error fetching chat:', err);
  }
}

main();
