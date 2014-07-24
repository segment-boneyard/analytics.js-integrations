
# FullStory Integration

- [Website](https://www.fullstory.com)
- [Documentation](https://www.fullstory.com/docs/developer)

## How our customers will use it

- Our customers will use FullStory to record every single event that happens on their website. They will then be able to replay that recording almost like a DVR.

## How we implemented their API

- To integrate FullStory we simply included the recording snippet (script) as instructed by FullStory at https://www.fullstory.com/ui/1JO/settings, and then added the option for _fs_org. We mapped our identify function to theirs by using their FS.identify function to initially set the user id with identify.userId() and then FS.setUserVars with identify.traits() as the argument.