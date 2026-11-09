// The return URL identifies a saved order. Only the server can verify payment.
export async function resumeCheckoutReturn(url, orders, confirm) {
  const params = new URL(url).searchParams;
  const ids = params.getAll('order');
  if (!ids.length) return null;
  const id = ids[0];
  const unavailable = {kind: 'unavailable', message: 'This checkout is not available in this browser workspace. Open the browser you used to start it.'};
  if (ids.length !== 1 || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)) return unavailable;
  const order = orders.find(item => item.id === id);
  if (!order) return unavailable;
  const result = (kind, message) => ({kind, orderId: id, message});
  if (order.receipt) return result('paid', 'Sandbox payment verified. Your purchased work is saved in this campaign.');
  if (params.has('cancelled')) return result('paused', 'Checkout paused. Your campaign is saved for when you return.');
  if (!order.paypalId) return result('saved', 'Your campaign is saved. Start checkout when you are ready.');
  try {
    const checked = await confirm(id);
    if (checked.id !== id || !checked.receipt) return result('pending', 'Payment confirmation is still pending. Use Check payment on this campaign to try again.');
    return result('paid', 'Sandbox payment verified. Your campaign is ready for production.');
  } catch (error) {
    return result('pending', error.message || 'Payment confirmation is still pending. Your campaign is saved; use Check payment to try again.');
  }
}
