import { supabase } from '@/lib/supabase';
import { useMutation } from '@tanstack/react-query';

export type TelemetryEvent = {
  event_type: string;
  event_data?: any;
  page_url?: string;
};

export function useTelemetry() {
  const trackEvent = useMutation({
    mutationFn: async (event: TelemetryEvent) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return; // Don't track for logged out users
      
      const { error } = await supabase
        .from('user_telemetry')
        .insert([{
          user_id: user.id,
          event_type: event.event_type,
          event_data: event.event_data,
          page_url: window.location.pathname,
          user_agent: navigator.userAgent
        }]);
      
      if (error) console.error('Telemetry error:', error);
    }
  });

  return {
    trackEvent: trackEvent.mutateAsync,
    isTracking: trackEvent.isPending
  };
}