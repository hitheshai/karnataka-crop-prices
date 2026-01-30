import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { crops, PriceData } from '@/data/karnataka-data';
import { toast } from 'sonner';

const PRICE_INCREASE_THRESHOLD = 5; // 5% increase triggers notification

export const usePriceAlerts = (priceData: PriceData[]) => {
  const { user } = useAuth();
  const previousPricesRef = useRef<Map<string, number>>(new Map());
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (!user || !priceData.length || hasCheckedRef.current) return;

    const checkPriceIncreases = async () => {
      hasCheckedRef.current = true;
      
      // Get user's profile to check their district preference
      const { data: profile } = await supabase
        .from('profiles')
        .select('district, main_crops')
        .eq('user_id', user.id)
        .maybeSingle();

      const userDistrict = profile?.district;
      const userCrops = profile?.main_crops || [];

      // Filter prices relevant to user
      const relevantPrices = priceData.filter(price => {
        if (userDistrict && price.district !== userDistrict) return false;
        if (userCrops.length > 0 && !userCrops.includes(price.cropId)) return false;
        return true;
      });

      // Check for significant price increases
      const notifications: Array<{
        crop_id: string;
        crop_name: string;
        district: string;
        old_price: number;
        new_price: number;
        price_change_percent: number;
      }> = [];

      for (const price of relevantPrices) {
        const key = `${price.cropId}-${price.district}`;
        const previousPrice = price.previousPrice;
        const currentPrice = price.modalPrice;

        if (previousPrice > 0) {
          const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;

          if (changePercent >= PRICE_INCREASE_THRESHOLD) {
            const crop = crops.find(c => c.id === price.cropId);
            notifications.push({
              crop_id: price.cropId,
              crop_name: crop?.name || 'Unknown Crop',
              district: price.district,
              old_price: previousPrice,
              new_price: currentPrice,
              price_change_percent: changePercent,
            });
          }
        }

        previousPricesRef.current.set(key, currentPrice);
      }

      // Insert notifications if any
      if (notifications.length > 0) {
        const notificationsToInsert = notifications.slice(0, 5).map(n => ({
          ...n,
          user_id: user.id,
        }));

        const { error } = await supabase
          .from('price_notifications')
          .insert(notificationsToInsert);

        if (!error && notifications.length > 0) {
          toast.success(
            `${notifications.length} crop${notifications.length > 1 ? 's' : ''} with price increases!`,
            {
              description: 'Check the bell icon for details',
            }
          );

          // Trigger external notifications (SMS/Email)
          const alertsForExternal = notifications.map(n => ({
            userId: user.id,
            cropName: n.crop_name,
            cropEmoji: crops.find(c => c.id === n.crop_id)?.image || '🌾',
            district: n.district,
            oldPrice: n.old_price,
            newPrice: n.new_price,
            changePercent: n.price_change_percent,
          }));

          // Send external notifications in background
          supabase.functions
            .invoke('send-price-alert', {
              body: { alerts: alertsForExternal },
            })
            .then(({ error: alertError }) => {
              if (alertError) {
                console.error('Error sending external alerts:', alertError);
              } else {
                console.log('External price alerts sent successfully');
              }
            });
        }
      }
    };

    // Small delay to ensure data is loaded
    const timer = setTimeout(checkPriceIncreases, 2000);
    return () => clearTimeout(timer);
  }, [user, priceData]);
};
