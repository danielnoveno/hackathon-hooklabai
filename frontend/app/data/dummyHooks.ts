import type { TopicKey } from '../config/topicPrompts';

export type DummyHook = {
  id: string;
  topic: TopicKey;
  content: string;
  preview: string;
};

export const DUMMY_HOOKS: Record<TopicKey, DummyHook[]> = {
  'NFT': [
    {
      id: 'nft-1',
      topic: 'NFT',
      preview: 'I just minted a custom Warplet with DNA generated from my Farcaster profile.',
      content:
        "I just minted a custom Warplet with DNA generated from my Farcaster profile. Join The Warplet family!"
    }
  ],

  'Web3 Update': [
    {
      id: 'web3-1',
      topic: 'Web3 Update',
      preview: 'Farcaster now supports Solana!',
      content:
        "Farcaster now supports Solana!\n\n- Starting today, wallet and mini apps work with Solana\n- Swap into any Solana token with instant bridging from other chains\n- Fund $10 of SOL to increase your chance for upcoming airdrops"
    }
  ],

  'Platform Update': [
    {
      id: 'platform-1',
      topic: 'Platform Update',
      preview: 'Update: Farcaster Rewards are changing',
      content:
        "Update: Farcaster Rewards are changing\n\nTomorrow will be the last day for current version of creator rewards. This experiment started a year ago and has paid out $1M+ to creators who casted on Farcaster. \n\nWhile this had some success, it's not aligned with our new direction. We will be launching a new experiment soon to replace the current program."
    }
  ],

  'Seasonal Greeting': [
    {
      id: 'seasonal-1',
      topic: 'Seasonal Greeting',
      preview: 'Happy holidays, from Base',
      content:
        "Happy holidays, from Base"
    }
  ],

  'Founder Profile': [
    {
      id: 'founder-1',
      topic: 'Founder Profile',
      preview: 'Meet @macedo.eth, co-founder of @talent',
      content:
        "Meet @macedo.eth, co-founder of \n@talent\n\nWhat started as a side experiment with crypto quickly became an obsession, leading him to build the reputation layer for builders\n\nThis is his story"
    }
  ],

  'Inspiration': [
    {
      id: 'inspiration-1',
      topic: 'Inspiration',
      preview: 'we are entering a new chapter',
      content:
        "we are entering a new chapter and with the new chapter comes new opportunity.\n\nours to seize."
    }
  ],

  'Community': [
    {
      id: 'community-1',
      topic: 'Community',
      preview: 'Community is everything.',
      content:
        "Community is everything.\n\nBuild it, nurture it, and it will take care of you."
    }
  ],

  'Product Update': [
    {
      id: 'product-1',
      topic: 'Product Update',
      preview: 'We just shipped a clear new feature.',
      content:
        "We just shipped a clear new feature.\n\nCheck out the changelog for details."
    }
  ]
};
