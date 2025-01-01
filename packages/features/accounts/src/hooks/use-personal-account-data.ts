import { useCallback } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

export function usePersonalAccountData(
  userId: string,
  partialAccount?: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
  },
) {
  const client = useSupabase();
  const queryKey = ['account:data', userId];

  const queryFn = async () => {
    if (!userId) {
      return null;
    }

    // First get the user's account through memberships
    const membershipResponse = await client
      .from('accounts_memberships')
      .select('account_id')
      .eq('user_id', userId)
      .single();

    if (membershipResponse.error) {
      throw membershipResponse.error;
    }

    // Then get the account details
    const response = await client
      .from('accounts')
      .select(
        `
        id,
        name,
        picture_url
      `,
      )
      .eq('id', membershipResponse.data.account_id)
      .single();

    if (response.error) {
      throw response.error;
    }

    return response.data;
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialData: partialAccount?.id
      ? {
          id: partialAccount.id,
          name: partialAccount.name,
          picture_url: partialAccount.picture_url,
        }
      : undefined,
  });
}

export function useRevalidatePersonalAccountDataQuery() {
  const queryClient = useQueryClient();

  return useCallback(
    (userId: string) =>
      queryClient.invalidateQueries({
        queryKey: ['account:data', userId],
      }),
    [queryClient],
  );
}
