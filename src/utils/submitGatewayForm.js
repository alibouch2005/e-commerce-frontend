export default function submitGatewayForm(payment) {
  if (!payment?.gateway_url || !/^https?:\/\//i.test(payment.gateway_url)) {
    throw new Error('Invalid payment gateway URL');
  }

  const form = document.createElement('form');
  form.method = payment.method || 'POST';
  form.action = payment.gateway_url;
  form.style.display = 'none';

  Object.entries(payment.fields || {}).forEach(([name, value]) => {
    if (value === null || value === undefined) return;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
