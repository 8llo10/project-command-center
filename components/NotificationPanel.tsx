'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Send, Smartphone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from './LocaleProvider';

const VAPID_PUBLIC_KEY = 'BGIE5X_9w0XOvJ8XMNSGYCBbS50hpaJ-VdghXWbvDIJAQDj4VrYBwA0i-KN3yyoxxTWi9oWDiJJvfA8pxj5Ldxc';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function NotificationPanel() {
  const { locale, t } = useLocale();
  const [supported, setSupported] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [needsHomeScreen, setNeedsHomeScreen] = useState(false);

  useEffect(() => {
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setSupported(ok);
    const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setNeedsHomeScreen(isiOS && !standalone);
    if (!ok) return;
    navigator.serviceWorker.register('/sw.js').then(async (registration) => {
      const subscription = await registration.pushManager.getSubscription();
      setEnabled(Boolean(subscription));
    }).catch(() => setSupported(false));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void syncLocale();
  }, [locale, enabled]);

  async function syncLocale() {
    const supabase = createClient();
    if (!supabase) return;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) await supabase.from('push_subscriptions').update({ locale, last_seen_at: new Date().toISOString() }).eq('endpoint', subscription.endpoint);
  }

  async function enablePush() {
    if (!supported) return;
    setBusy(true); setMessage('');
    try {
      if (needsHomeScreen) throw new Error(t.iosInstall);
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error(locale === 'ar' ? 'ما تم السماح بالتنبيهات من المتصفح.' : 'Notification permission was not granted.');
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) });

      const json = subscription.toJSON();
      const supabase = createClient();
      if (!supabase) throw new Error('Supabase unavailable');
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error(locale === 'ar' ? 'سجلي دخولك أولًا.' : 'Sign in first.');
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: authData.user.id,
        endpoint: subscription.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
        locale,
        user_agent: navigator.userAgent,
        last_seen_at: new Date().toISOString(),
      }, { onConflict: 'endpoint' });
      if (error) throw error;
      setEnabled(true);
      setMessage(t.notificationsEnabled);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Push setup failed');
    } finally { setBusy(false); }
  }

  async function disablePush() {
    setBusy(true); setMessage('');
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      const supabase = createClient();
      if (subscription && supabase) await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint);
      if (subscription) await subscription.unsubscribe();
      setEnabled(false);
      setMessage(locale === 'ar' ? 'تم إيقاف تنبيهات هذا الجهاز.' : 'Notifications disabled on this device.');
    } finally { setBusy(false); }
  }

  async function sendTest() {
    setBusy(true); setMessage('');
    try {
      const supabase = createClient();
      if (!supabase) throw new Error('Supabase unavailable');
      const { error } = await supabase.functions.invoke('send-test-push', { body: { locale } });
      if (error) throw error;
      setMessage(locale === 'ar' ? 'أرسلت تنبيه تجريبي لجهازك ✅' : 'Test notification sent ✅');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Test failed');
    } finally { setBusy(false); }
  }

  return (
    <section className="notification-panel">
      <div className="section-heading">
        <div className="icon-box"><Smartphone size={18}/></div>
        <div><p className="eyebrow">{t.ownerOnly}</p><h2>{t.notifications}</h2></div>
      </div>
      <p className="muted-copy">{t.healthRule}</p>
      {!supported && <p className="notice">{t.unsupportedPush}</p>}
      {needsHomeScreen && <p className="notice">{t.iosInstall}</p>}
      <div className="notification-actions">
        {!enabled ? (
          <button type="button" onClick={enablePush} disabled={busy || !supported}><Bell size={16}/>{t.enableNotifications}</button>
        ) : (
          <>
            <button type="button" onClick={sendTest} disabled={busy}><Send size={16}/>{t.testNotification}</button>
            <button type="button" className="secondary-button" onClick={disablePush} disabled={busy}><BellOff size={16}/>{t.disableNotifications}</button>
          </>
        )}
      </div>
      {message && <p className="notice">{message}</p>}
    </section>
  );
}
