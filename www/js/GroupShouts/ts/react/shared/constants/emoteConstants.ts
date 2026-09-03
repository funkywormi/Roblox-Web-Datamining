import { EnvironmentUrls } from 'Roblox';

const { groupsApi } = EnvironmentUrls;

const emotesUrlPrefix = `${groupsApi}/v1/groups`;

export enum EmoteName {
  LOVE = 'love',
  ANGRY = 'angry',
  SAD = 'sad',
  VERY_POSITIVE = 'very-positive',
  THINKING = 'thinking',
  THUMBS_UP = 'thumbs-up',
  FIRE = 'fire',
  SKULL = 'skull',
  WOW = 'wow'
}

export default {
  emoteNameToUrl: (emoteName: string): string => {
    switch (emoteName) {
      case EmoteName.LOVE:
        return 'https://images.rbxcdn.com/5a1edd5a80c90267f5ffb58f29cc2dc5-reaction_love.png';
      case EmoteName.ANGRY:
        return 'https://images.rbxcdn.com/ddb6500e23b1235aa048d03e8aabeee2-reaction_angry.png';
      case EmoteName.SAD:
        return 'https://images.rbxcdn.com/d4bbffc8988163fbf51d6fcbcb39da57-reaction_sad.png';
      case EmoteName.VERY_POSITIVE:
        return 'https://images.rbxcdn.com/65fd29151733879cf19ed3eb56edcd26-reaction_smile.png';
      case EmoteName.THINKING:
        return 'https://images.rbxcdn.com/55a78b84c12495198bcbcf0cac3b017a-reaction_thinking.png';
      case EmoteName.THUMBS_UP:
        return 'https://images.rbxcdn.com/12fa6ee6a029c07f2d5903f71177e151-reaction_thumbs_up.png';
      case EmoteName.FIRE:
        return 'https://images.rbxcdn.com/31de4960cefa8df1fe8723424ec5cdb8-reaction_fire.png';
      case EmoteName.SKULL:
        return 'https://images.rbxcdn.com/040c0fbe67952168f4089029cec13e53-reaction_skull.png';
      case EmoteName.WOW:
        return 'https://images.rbxcdn.com/6c53bf648f0604857c99c44757717012-reaction_wow.png';
      default:
        return '';
    }
  },
  emoteOrder: [
    EmoteName.LOVE,
    EmoteName.SAD,
    EmoteName.THUMBS_UP,
    EmoteName.ANGRY,
    EmoteName.THINKING,
    EmoteName.VERY_POSITIVE,
    EmoteName.FIRE,
    EmoteName.SKULL,
    EmoteName.WOW
  ],
  urls: {
    getGroupEmoteSetsEndpoint(groupId: number): string {
      return `${emotesUrlPrefix}/${groupId}/emotes`;
    }
  }
};
