import { useState, useEffect } from 'react';
import { Bell, Mail, Phone, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NotificationPreferences {
  sms_notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  notification_email: string;
  phone: string;
  price_alert_threshold: number;
}

export const NotificationSettings = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    sms_notifications_enabled: false,
    email_notifications_enabled: false,
    notification_email: '',
    phone: '',
    price_alert_threshold: 5,
  });

  useEffect(() => {
    if (!user || !isOpen) return;

    const fetchPreferences = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('sms_notifications_enabled, email_notifications_enabled, notification_email, phone, price_alert_threshold')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching preferences:', error);
      } else if (data) {
        setPreferences({
          sms_notifications_enabled: data.sms_notifications_enabled ?? false,
          email_notifications_enabled: data.email_notifications_enabled ?? false,
          notification_email: data.notification_email ?? user.email ?? '',
          phone: data.phone ?? '',
          price_alert_threshold: data.price_alert_threshold ?? 5,
        });
      }
      setLoading(false);
    };

    fetchPreferences();
  }, [user, isOpen]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        sms_notifications_enabled: preferences.sms_notifications_enabled,
        email_notifications_enabled: preferences.email_notifications_enabled,
        notification_email: preferences.notification_email,
        phone: preferences.phone,
        price_alert_threshold: preferences.price_alert_threshold,
      })
      .eq('user_id', user.id);

    setSaving(false);

    if (error) {
      toast.error('Failed to save preferences');
      console.error('Error saving preferences:', error);
    } else {
      toast.success('Notification preferences saved!');
      setIsOpen(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" title="Notification Settings">
          <Settings2 className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </DialogTitle>
          <DialogDescription>
            Get notified when crop prices increase significantly
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Price Alert Threshold */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Alert me when prices increase by: {preferences.price_alert_threshold}%+
              </Label>
              <Slider
                value={[preferences.price_alert_threshold]}
                onValueChange={([value]) =>
                  setPreferences(prev => ({ ...prev, price_alert_threshold: value }))
                }
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Set higher for fewer alerts, lower for more frequent alerts
              </p>
            </div>

            {/* SMS Notifications */}
            <div className="space-y-3 p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="sms-toggle" className="text-sm font-medium">
                    SMS Notifications
                  </Label>
                </div>
                <Switch
                  id="sms-toggle"
                  checked={preferences.sms_notifications_enabled}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, sms_notifications_enabled: checked }))
                  }
                />
              </div>
              {preferences.sms_notifications_enabled && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="phone" className="text-xs text-muted-foreground">
                    Phone Number (with country code)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={preferences.phone}
                    onChange={(e) =>
                      setPreferences(prev => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>
              )}
            </div>

            {/* Email Notifications */}
            <div className="space-y-3 p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="email-toggle" className="text-sm font-medium">
                    Email Notifications
                  </Label>
                </div>
                <Switch
                  id="email-toggle"
                  checked={preferences.email_notifications_enabled}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, email_notifications_enabled: checked }))
                  }
                />
              </div>
              {preferences.email_notifications_enabled && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="notification-email" className="text-xs text-muted-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="notification-email"
                    type="email"
                    placeholder="your@email.com"
                    value={preferences.notification_email}
                    onChange={(e) =>
                      setPreferences(prev => ({ ...prev, notification_email: e.target.value }))
                    }
                  />
                </div>
              )}
            </div>

            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
