import { useCallback, useEffect, useRef, useState } from "react";
import {
  CreateMessage,
  ImageUrl,
  isAssistantOutput,
  isUserInput,
  Message,
  Options,
  RoleType,
} from "./types";
import {
  createParser,
  EventSourceParser,
  type ParsedEvent,
  type ReconnectInterval,
} from "eventsource-parser";
import { traceId } from "src/utils/traceId-gen";
import {
  ProxyYunjingServiceApiFactory,
  YunjingServiceChatInputType,
  YunjingServiceChatOutputType,
  YunjingServiceGetSceneHistory,
  YunjingServiceGiftInfo,
  YunjingServiceGroupCharacterOperation,
  YunjingServiceProxySceneChatRequest,
  YunjingServiceSceneChatRequest,
  YunjingServiceSceneType,
  YunjingServiceSceneChatResponse,
  YunjingServiceTTSInfo,
} from "../../apis/saylo-proxy";
import { ChatError, ErrorCode } from "./error";
import fetch from "./fetch";
import { SseReportInfoType } from "./sse-report";
import { APP_ID } from "../../constants/constants";
import { uuid } from "../../utils/uuid";
import { t } from "i18next";
import { Authorization } from "src/state/context";
import { encryptToken } from "src/utils/token-encrypt";
import { userAutoplayEnabled } from "../../state/autoplay-state.ts";
import { useReadingStore } from "src/navigations/reading/component/reading/store/readingState.ts";
import { iSensor } from "src/sensor-init.ts";
import { getGiftIdFromUrl } from "src/utils/utils.ts";
import { getBackendTimeStamp } from "../../utils/timer-manager.ts";

type Response = Required<YunjingServiceSceneChatResponse>;

interface ChatRequestOptions {
  headers?: Record<string, string>;
  body?: Record<string, any>;
}
enum RecordManual {
  // 默认
  MANUAL_DEFAULT = 0,
  // 输入来自于用户自定义
  MANUAL_USER = 1,
  // 消息来源于推送
  MANUAL_PUSH = 2,
  // 消息来源于continue(私聊)
  MANUAL_CONTINUE = 3,
  // 消息已经被窥探
  MANUAL_PEEKED = 4,
  // 消息来源于continue(群聊)
  MANUAL_CONTINUE_GROUP = 5,
  // 消息来源用户say（私聊）
  MANUAL_USER_SAY = 6,
  // 消息来源用户say（群聊）
  MANUAL_USER_SAY_GROUP = 7,
  // 消息来源用户do（私聊）
  MANUAL_USER_DO = 8,
  // 消息来源用户do（群聊）
  MANUAL_USER_DO_GROUP = 9,
  // 消息来源于用户送礼（私聊）
  MANUAL_USER_GIFT = 10,
  // 消息来源于用户送礼（群聊）
  MANUAL_USER_GIFT_GROUP = 11,
  // 消息来源于VQA(私聊)
  MANUAL_VQA = 12,
  // 消息来源于VQA(群聊)
  MANUAL_VQA_GROUP = 13,
  // 消息来源于continue do(私聊)
  MANUAL_CONTINUE_DO = 14,
  // 消息来源于continue do(群聊)
  MANUAL_CONTINUE_DO_GROUP = 15,
}
export interface UseChatProps {
  sceneId: string;
  url: string;
  onResponse?: (response: Response) => void;
  /**
   * 请求开始事件
   * @returns void
   */
  onStart?: (e: SseReportInfoType) => void;
  /**
   * 首字回包触发事件
   * @returns void
   */
  onStartResponse?: (traceId: string, type: string) => void;
  /**
   * 尽量用 error 对象
   * @param error
   * @returns
   */
  onError?: (error: ChatError, traceId: string) => void;
  onFinish?: (traceId: string) => void;
  onGenerateStopped?: () => void;
  chatRequestOptions?: ChatRequestOptions;
  onTTS?: (messageId: string, tts: YunjingServiceTTSInfo) => void;
  onChangeBackgroundVideo?: (videoUrl: string, voiceUrl?: string) => void;
  chatModeId?: string;
  /**
   * 本地生成停止事件
   * @returns void
   */
  onLocalGenerateStopped?: () => void;
}

export type ChatContext = ReturnType<typeof useChat>;

const useChat = ({
  sceneId,
  onResponse,
  onError,
  onStart,
  onStartResponse,
  onFinish,
  onGenerateStopped,
  chatRequestOptions,
  onTTS,
  url,
  onChangeBackgroundVideo,
  chatModeId,
  onLocalGenerateStopped,
}: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [options, setOptions] = useState<Options[]>([]);
  const [input, setInput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isBackendGenerating, setIsBackendGenerating] =
    useState<boolean>(false);
  const [isGeneratingSayOptions, setIsGeneratingSayOptions] =
    useState<boolean>(false);
  const [isGeneratingDoOptions, setIsGeneratingDoOptions] =
    useState<boolean>(false);
  const [error, setError] = useState<ChatError>();
  const [optionsError, setOptionsError] = useState<ChatError>();
  const abortControllerRef = useRef<AbortController | null>(null);

  const lastMessageRef = useRef<Message | null>(null);
  const secondLastMessageRef = useRef<Message | null>(null);

  const isRetrying = useRef(false);
  const isRetryingOptions = useRef(false);
  const timeSpace = useRef<number>(APP_ID.value === "30005" ? 35 : 75);
  const streamTextLength = useRef<number>(APP_ID.value === "30005" ? 3 : 3);
  const { switchVideoEnabled } = useReadingStore((state) => ({
    switchVideoEnabled: state.switchVideoEnabled,
  }));

  useEffect(() => {
    if (messages?.length > 0) {
      lastMessageRef.current = messages[messages?.length - 1];
      secondLastMessageRef.current = messages[messages?.length - 2];
    }
  }, [messages]);

  const patchInputMessageId = useCallback(
    async (inputMessageId: string) => {
      const { messageId } =
        (await ProxyYunjingServiceApiFactory().proxyGetNextMessage({
          body: {
            data: {
              sceneId,
              messageId: inputMessageId,
            },
          },
        })) || {};

      if (messageId) {
        setMessages((prev) => {
          // 找到最后一条用户输入的消息，然后替换他的 id
          // @ts-ignore
          const lastUserInputMessageIndex = prev.findLastIndex((item) =>
            isUserInput(item.role!)
          );
          return prev.map((item, index) => {
            if (index === lastUserInputMessageIndex) {
              return {
                ...item,
                id: messageId,
              };
            }
            return item;
          });
        });
      }
    },
    [sceneId]
  );

  const getReadableStream = useCallback(
    async (message: Message | CreateMessage, parser: EventSourceParser) => {
      console.log("getReadableStream", "start");
      const trace_id = message.traceId || traceId();
      try {
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        const interfaceName =
          "yunjing_service/SceneConversationService/SceneChat";
        const data: YunjingServiceProxySceneChatRequest = {
          interfaceName: interfaceName,
          data: {
            sceneId,
            input: message.content,
            ...chatRequestOptions?.body,
            inputType: message.type as YunjingServiceChatInputType,
            messageId: message.id || "",
            imageUrl: message.imageUrl,
            characters: message.characters,
            sceneType: message.sceneType,
            audioAutoPlay: userAutoplayEnabled,
            giftInfo: message.giftInfo,
          },
        };

        const body = JSON.stringify(data);
        const timeStamp = (await getBackendTimeStamp()) * 1000;
        onStart &&
          onStart({
            traceId: trace_id,
            sendMessage: message.content,
            send_type: message.type ?? "",
          });
        const encToken = encryptToken({
          token: Authorization.token,
          password: "saylo2024@xverse",
          version: chatRequestOptions?.headers?.["x-xverse-version"],
          timestamp: timeStamp,
        });
        let response;
        try {
          response = await fetch(url, {
            // @ts-ignore
            reactNative: { textStreaming: true },
            method: "POST",
            signal: abortController.signal,
            headers: {
              "x-xverse-token": encToken,
              "x-xverse-frontend": "saylo_app",
              "x-xverse-timestamp": timeStamp,
              "x-xverse-trace-id": trace_id,
              ...chatRequestOptions?.headers,
            },
            body: body,
          });
          if (!response.ok) {
            throw new ChatError({
              message: "NetworkError",
              code: ErrorCode.NetworkError,
            });
          }
        } catch (error: any) {
          if (error.name === "AbortError") {
            console.log("Request aborted:", error.message);
            return;
          }
          console.error(error);
          throw new ChatError({
            message: "NetworkError",
            code: ErrorCode.NetworkError,
            rawError: error,
          });
        }
        onStartResponse && onStartResponse(trace_id, message.type ?? "");
        const reader = response?.body?.getReader();
        const decoder = new TextDecoder();

        const streamReader = async () => {
          if (!reader) return;
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              onFinish && onFinish(trace_id);
              break;
            }
            parser.feed(decoder.decode(value, { stream: true }));
          }
        };

        await streamReader();
        return reader;
      } catch (error: any) {
        onError && onError(error, trace_id);
        throw error;
      }
    },
    [
      sceneId,
      chatRequestOptions?.body,
      chatRequestOptions?.headers,
      onStart,
      url,
      onStartResponse,
      onFinish,
      onError,
    ]
  );

  // 选项重连
  const parseOptions = useCallback((responseData: Response) => {
    if (!responseData.data) return;
    console.log("parseOptions", responseData.data);
    const { optionSlot, content, outputType, messageId } = responseData.data;
    if (!messageId) return;
    setOptions((prevOptions) => {
      const newOptions = [...prevOptions];
      const option = newOptions.find(
        (item) => item.type === outputType && item.optionSlot === optionSlot
      );

      if (option) {
        const index = newOptions.indexOf(option);
        // 创建新对象以避免直接修改原对象
        newOptions[index] = { ...option, content: option.content + content };
      } else {
        newOptions.push({
          content: content || "",
          optionSlot: optionSlot || 0,
          type: outputType!,
          id: messageId,
        });
      }
      return newOptions.filter(Boolean);
    });
  }, []);

  const isChatInputType = (type: string): boolean => {
    return Object.values(YunjingServiceChatInputType).includes(
      type as YunjingServiceChatInputType
    );
  };

  const append = useCallback(
    async (message: Message | CreateMessage) => {
      // if (message.type !== YunjingServiceChatInputType.SseSessionReconnect) {
      setOptions([]);
      // }
      const isInputType = isChatInputType(message.type || "");
      if (
        isGenerating ||
        isGeneratingSayOptions ||
        isGeneratingDoOptions ||
        !isInputType
      )
        return;
      message.traceId = traceId();
      const lastAssistantMessageId = isAssistantOutput(
        lastMessageRef.current!.role
      )
        ? lastMessageRef.current?.id
        : "";

      setIsGenerating(true);
      setIsBackendGenerating(true);
      // 用户输入时插入输入消息
      if (
        ![
          YunjingServiceChatInputType.SseHistoryRetry,
          YunjingServiceChatInputType.SseSessionReconnect,
          YunjingServiceChatInputType.SseFailureRetry,
          YunjingServiceChatInputType.SseDialogContinue,
          YunjingServiceChatInputType.SseNewUserRetain,
        ].includes(message.type as YunjingServiceChatInputType)
      ) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            ...message,
            id: Date.now().toString(),
            timestamp: Date.now(),
            manual: 0,
          },
        ]);
      }
      let intervalId: NodeJS.Timeout | null = null;
      try {
        const dialogOutputMessage: Message = {
          id: uuid(),
          content: "",
          role: RoleType.AssistantReply,
          timestamp: Date.now(),
          type: YunjingServiceChatOutputType.SseDialogOutput,
          manual: 0,
          thinkingText: chatModeId?.includes("DEEPSEEK") ? "" : undefined,
        };
        const storyOutputMessage: Message = {
          id: uuid(),
          content: "",
          role: RoleType.AssistantStoryReply,
          timestamp: Date.now(),
          type: YunjingServiceChatOutputType.SseStoryOutput,
          manual: 0,
          thinkingText: chatModeId?.includes("DEEPSEEK") ? "" : undefined,
        };
        const imageOutputMessage: Message = {
          id: uuid(),
          content: "",
          role: RoleType.AssistantSendGiftImage,
          timestamp: Date.now(),
          type: YunjingServiceChatOutputType.SseImageOutput,
          manual: 0,
        };
        const aiVideoOutputMessage: Message = {
          id: uuid(),
          content: "",
          role: RoleType.AssistantSendVideoLock,
          timestamp: Date.now(),
          type: YunjingServiceChatOutputType.SseDynamicCharacterOutput,
          manual: 0,
          imageUrl: {},
        };

        // 插入回复的空消息来做loading
        if (
          ![
            YunjingServiceChatInputType.SseHistoryRetry,
            YunjingServiceChatInputType.SseSessionReconnect,
            YunjingServiceChatInputType.SseFailureRetry,
          ].includes(message.type as YunjingServiceChatInputType)
        ) {
          if (
            message.role === RoleType.UserInput ||
            message.role === RoleType.UserVideoInput ||
            message.role === RoleType.UserImageInput ||
            message.role === RoleType.UserSendGift
          ) {
            setMessages((prevMessages) => [
              ...prevMessages,
              dialogOutputMessage,
            ]);
          } else if (message.role === RoleType.UserStoryInput) {
            setMessages((prevMessages) => [
              ...prevMessages,
              storyOutputMessage,
            ]);
          }
        }
        const accumulatedContent = {} as Record<string, any>;
        let finishReason: string | null = null;
        let outputType: YunjingServiceChatOutputType | null = null;
        const parser = createParser(
          (event: ParsedEvent | ReconnectInterval) => {
            if (event.type === "event" && event.event !== "stop") {
              const responseData: Response = JSON.parse(event.data);
              if (responseData.code !== 0 || !responseData.data) {
                const error = new ChatError({
                  code: responseData.code,
                  message: responseData.msg || "",
                });
                console.log(error);
                throw error;
              }
              const isImage =
                responseData.data.outputType ===
                YunjingServiceChatOutputType.SseImageOutput;
              const isDialog =
                responseData.data.outputType ===
                  YunjingServiceChatOutputType.SseDialogOutput ||
                responseData.data.outputType ===
                  YunjingServiceChatOutputType.SseThinkingOutput ||
                responseData.data.outputType ===
                  YunjingServiceChatOutputType.SseDialogOutputVideo;
              const isOption = [
                YunjingServiceChatOutputType.SseDialogOption,
                YunjingServiceChatOutputType.SseStoryOption,
              ].includes(responseData.data.outputType!);

              if (isOption) {
                // 重连选项的时候走了这里
                return parseOptions(responseData);
              }

              let tts: YunjingServiceTTSInfo | undefined;
              if ((tts = responseData?.data?.ttsInfo) && tts.url?.length) {
                // TOOD: 处理 say/do messageId
                console.log("mp3 data", responseData?.data?.ttsInfo);
                onTTS?.(responseData.data.messageId || "", tts);
                return;
              }
              let outputTypeKey = responseData.data.outputType!;
              if (
                outputTypeKey == YunjingServiceChatOutputType.SseThinkingOutput
              ) {
                outputTypeKey = YunjingServiceChatOutputType.SseDialogOutput;
              }
              if (
                outputTypeKey ==
                YunjingServiceChatOutputType.SseStoryThinkingOutput
              ) {
                outputTypeKey = YunjingServiceChatOutputType.SseStoryOutput;
              }
              if (
                responseData.data.outputType ===
                  YunjingServiceChatOutputType.DefaulOutputType ||
                (responseData.data.outputType ===
                  YunjingServiceChatOutputType.SseDynamicCharacterOutput &&
                  responseData?.data?.imageInfo?.isUnlocked)
              ) {
                console.log(
                  "onChangeBackgroundVideo_chat",
                  responseData?.data?.imageInfo
                );
                if (responseData?.data?.imageInfo) {
                  onChangeBackgroundVideo?.(
                    responseData?.data?.imageInfo?.dynamicBackgroundVideoUrl ||
                      "",
                    responseData?.data?.imageInfo?.dynamicVoiceUrl || ""
                  );
                }
                return;
              }

              const newMessage = isImage
                ? imageOutputMessage
                : isDialog
                ? dialogOutputMessage
                : storyOutputMessage;
              const newMid =
                responseData.data.messageId ||
                uuid() + responseData.data.outputType;

              if (!accumulatedContent[newMid]) {
                accumulatedContent[newMid] = {
                  accumulatedText: "",
                  thinkingText: "",
                  newMessage: { ...newMessage, content: "" },
                };
              }
              const contentData = accumulatedContent[newMid];
              if (
                responseData.data.outputType ==
                  YunjingServiceChatOutputType.SseThinkingOutput ||
                responseData.data.outputType ==
                  YunjingServiceChatOutputType.SseStoryThinkingOutput
              ) {
                contentData.thinkingText += responseData.data.content;
              } else {
                contentData.accumulatedText += responseData.data.content;
              }
              contentData.newMessage.id =
                responseData.data.messageId || contentData.newMessage.id;
              contentData.newMessage.traceId = responseData.traceId;
              if (
                responseData.data.outputType ==
                YunjingServiceChatOutputType.SseThinkingOutput
              ) {
                contentData.newMessage.type =
                  YunjingServiceChatOutputType.SseDialogOutput;
              } else if (
                responseData.data.outputType ==
                YunjingServiceChatOutputType.SseStoryThinkingOutput
              ) {
                contentData.newMessage.type =
                  YunjingServiceChatOutputType.SseStoryOutput;
              } else {
                contentData.newMessage.type = responseData.data.outputType;
              }

              contentData.newMessage.charName =
                responseData.data?.charInfo?.charName;
              contentData.newMessage.charId =
                responseData?.data.charInfo?.charId;
              contentData.newMessage.ttsSpeakerId =
                responseData?.data?.charInfo?.charTtsSpeaker;
              contentData.newMessage.manual = responseData.data?.manual || 0;
              contentData.newMessage.round = responseData.data?.round || 0;
              contentData.newMessage.getBetterVideo =
                responseData.data?.getBetterVideo || false;

              if (responseData.data.imageInfo) {
                contentData.newMessage.imageUrl = responseData.data.imageInfo;
                console.log("anyImgdata:", responseData.data.imageInfo);
                if (
                  responseData.data.outputType ===
                    YunjingServiceChatOutputType.SseDynamicCharacterOutput &&
                  !responseData.data.imageInfo.isUnlocked
                ) {
                  contentData.newMessage.imageUrl = responseData.data.imageInfo;
                  // Todo：判断是否要去掉return
                  // return
                } else {
                  contentData.newMessage.imageUrl = responseData.data.imageInfo;
                  if (!responseData.data.imageInfo.imageAssemble) {
                    setMessages((prevMessages) => {
                      console.log(
                        "see data",
                        prevMessages[prevMessages?.length - 1]
                      );
                      const newMessages = [...prevMessages];
                      newMessages[newMessages?.length - 1] =
                        contentData.newMessage;
                      return newMessages;
                    });
                  }
                }
              } else {
                if (!intervalId) {
                  let currentOutputType: YunjingServiceChatOutputType =
                    outputTypeKey;
                  intervalId = setInterval(() => {
                    const contentData = accumulatedContent[currentOutputType];
                    if (contentData && contentData.thinkingText?.length > 0) {
                      const currentChar = contentData.thinkingText.slice(
                        0,
                        streamTextLength.current
                      );
                      contentData.thinkingText = contentData.thinkingText.slice(
                        streamTextLength.current
                      );
                      if (contentData.newMessage.thinkingText == undefined) {
                        contentData.newMessage.thinkingText = "";
                      }
                      contentData.newMessage.thinkingText += currentChar;

                      setMessages((prevMessages) => {
                        const lastMessage =
                          prevMessages[prevMessages?.length - 1];
                        const newMessages = [...prevMessages];
                        if (
                          lastMessage.id &&
                          lastMessage.id !== contentData.newMessage.id
                        ) {
                          if (
                            lastMessage.role === RoleType.UserImageInput ||
                            lastMessage.content ||
                            lastMessage.role === RoleType.UserSendGift ||
                            lastMessage.role === RoleType.AssistantSendGiftImage
                          ) {
                            newMessages.push(contentData.newMessage);
                          } else {
                            newMessages[newMessages?.length - 1] =
                              contentData.newMessage;
                          }
                        } else {
                          newMessages[newMessages?.length - 1] =
                            contentData.newMessage;
                        }

                        return newMessages;
                      });
                    } else if (
                      contentData &&
                      contentData.accumulatedText?.length > 0
                    ) {
                      const currentChar = contentData.accumulatedText.slice(
                        0,
                        streamTextLength.current
                      );
                      contentData.accumulatedText =
                        contentData.accumulatedText.slice(
                          streamTextLength.current
                        );

                      contentData.newMessage.content += currentChar;

                      setMessages((prevMessages) => {
                        const lastMessage =
                          prevMessages[prevMessages?.length - 1];
                        const newMessages = [...prevMessages];
                        if (
                          lastMessage.id &&
                          lastMessage.id !== contentData.newMessage.id
                        ) {
                          if (
                            lastMessage.role === RoleType.UserImageInput ||
                            lastMessage.content ||
                            lastMessage.role === RoleType.UserSendGift ||
                            lastMessage.role === RoleType.AssistantSendGiftImage
                          ) {
                            newMessages.push(contentData.newMessage);
                          } else {
                            newMessages[newMessages?.length - 1] =
                              contentData.newMessage;
                          }
                        } else {
                          newMessages[newMessages?.length - 1] =
                            contentData.newMessage;
                        }

                        return newMessages;
                      });
                    } else {
                      console.log("change outputType", currentOutputType);
                      // 切换到下一个 outputType
                      const keys = Object.keys(
                        accumulatedContent
                      ) as YunjingServiceChatOutputType[];
                      const currentIndex = keys.indexOf(currentOutputType);
                      if (currentIndex < keys?.length - 1) {
                        currentOutputType = keys[currentIndex + 1];
                      } else {
                        currentOutputType = keys[0];
                      }

                      // 检查是否所有 outputType 的 accumulatedText 都为空
                      const allEmpty = keys.every(
                        (key) =>
                          accumulatedContent[key].accumulatedText.length ===
                            0 &&
                          accumulatedContent[key].thinkingText.length === 0
                      );
                      if (allEmpty) {
                        clearInterval(intervalId!);
                        intervalId = null;

                        if (finishReason === "stop") {
                          const msgVideo = Object.values(
                            accumulatedContent
                          ).find(
                            (item) =>
                              item.newMessage.type ===
                              YunjingServiceChatOutputType.SseDialogOutputVideo
                          );
                          if (msgVideo) {
                            msgVideo.newMessage.content = "视频生成中....";
                            msgVideo.newMessage.chatVideoInfo = {
                              videoUrl: "",
                              quotedMsgId: message.id,
                              quotedContent: message.content,
                            };
                            msgVideo.newMessage.type =
                              YunjingServiceChatOutputType.SseDialogOutput;
                            msgVideo.newMessage.role = RoleType.AssistantReply;
                            setMessages((prevMessages) => {
                              console.log("see data", msgVideo?.newMessage);
                              const newMessages = [
                                ...prevMessages,
                                msgVideo.newMessage,
                              ];
                              return newMessages;
                            });
                          }

                          const dynamicVideo = Object.values(
                            accumulatedContent
                          ).find(
                            (item) =>
                              item.newMessage.type ===
                              YunjingServiceChatOutputType.SseDynamicCharacterOutput
                          );
                          console.log("dynamicVideo", dynamicVideo);
                          if (
                            dynamicVideo &&
                            switchVideoEnabled &&
                            !dynamicVideo?.newMessage?.imageUrl?.isUnlocked
                          ) {
                            setMessages((prevMessages) => {
                              return [
                                ...prevMessages,
                                {
                                  ...aiVideoOutputMessage,
                                  imageUrl: dynamicVideo?.newMessage?.imageUrl,
                                },
                              ];
                            });
                          }

                          const assemble = Object.values(
                            accumulatedContent
                          ).find(
                            (item) =>
                              item.newMessage?.imageUrl?.imageAssemble &&
                              item.newMessage?.role !== RoleType.UserSendGift &&
                              item.role !== RoleType.UserImageInput
                          );
                          if (assemble) {
                            assemble.newMessage.content =
                              (assemble.subInfo?.length ?? 0) > 1
                                ? t("multi_photo_msg")
                                : t("single_photo_msg");
                            assemble.newMessage.role = RoleType.AssistantReply;
                            assemble.newMessage.type =
                              YunjingServiceChatOutputType.SseDialogOutput;
                            setMessages((prevMessages) => {
                              const newMessages = [
                                ...prevMessages,
                                assemble.newMessage,
                              ];
                              return newMessages;
                            });
                            iSensor.track("Giftreward_ep", {
                              publicData: {
                                plot_id: sceneId || "",
                              },
                              ext1: JSON.stringify({
                                photo_id: assemble.subInfo || [],
                                gift_source:
                                  getGiftIdFromUrl(
                                    assemble.subInfo?.[0].url || ""
                                  ) || "",
                              }),
                            });
                          }
                          onLocalGenerateStopped?.();
                          setIsGenerating(false);
                        }
                      }
                    }
                  }, timeSpace.current);
                }
              }

              if (onResponse) onResponse(responseData);
              if (responseData.data.finishReason === "stop") {
                finishReason = "stop";
                if (
                  lastAssistantMessageId &&
                  ![
                    YunjingServiceChatInputType.SseHistoryRetry,
                    YunjingServiceChatInputType.SseSessionReconnect,
                    YunjingServiceChatInputType.SseFailureRetry,
                    YunjingServiceChatInputType.SseDialogContinue,
                    YunjingServiceChatInputType.SseNewUserRetain,
                  ].includes(message.type as YunjingServiceChatInputType)
                ) {
                  patchInputMessageId(lastAssistantMessageId);
                }
                onGenerateStopped?.();
                setIsBackendGenerating(false);
                outputType = responseData.data.outputType!;
              }
            } else if (event.type === "reconnect-interval") {
              console.log(
                "We should set reconnect interval to %d milliseconds",
                event.value
              );
            }
          }
        );
        await getReadableStream(message, parser);
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Request aborted:", error.message);
          return;
        }
        console.error("rawError", error);
        let fatalError = error;
        if (!error.code) {
          fatalError = new ChatError({
            code: ErrorCode.UnknownError,
            message: error.message,
          });
        }
        setError(fatalError);
        throw fatalError;
      } finally {
        if (!intervalId) {
          setIsGenerating(false);
          setIsBackendGenerating(false);
          onLocalGenerateStopped?.();
        }
      }
    },
    [
      getReadableStream,
      isGenerating,
      isGeneratingSayOptions,
      isGeneratingDoOptions,
      onResponse,
      parseOptions,
    ]
  );

  const removeVideoMessage = useCallback(() => {
    setMessages((prevMessages) => {
      const newMessages = prevMessages.filter((item) => {
        return (
          item.type != YunjingServiceChatOutputType.SseDynamicCharacterOutput
        );
      });
      return newMessages;
    });
  }, []);

  const generateOptions = useCallback(
    async (
      retry = false,
      optionType:
        | YunjingServiceChatInputType.SseStoryOptionsGen
        | YunjingServiceChatInputType.SseDialogOptionsGen = YunjingServiceChatInputType.SseDialogOptionsGen,
      retryType:
        | YunjingServiceChatInputType.SseRegenDo
        | YunjingServiceChatInputType.SseRegenSay = YunjingServiceChatInputType.SseRegenSay
    ) => {
      // if (isBackendGenerating || isGeneratingSayOptions) return
      const message: CreateMessage = {
        type: retry ? retryType : optionType,
        content: "",
        role: RoleType.UserInput,
        id: retry ? options?.[0]?.id : "",
      };
      if (optionType === YunjingServiceChatInputType.SseStoryOptionsGen) {
        if (isBackendGenerating || isGeneratingDoOptions) return;
        setIsGeneratingDoOptions(true);
      } else {
        if (isBackendGenerating || isGeneratingSayOptions) return;
        setIsGeneratingSayOptions(true);
      }
      if (retry) {
        if (retryType === YunjingServiceChatInputType.SseRegenSay) {
          setIsGeneratingSayOptions(true);
          setOptions((prevOptions) => {
            const newOptions = [...prevOptions].filter(
              (item) =>
                item.type !== YunjingServiceChatOutputType.SseDialogOption
            );
            return newOptions;
          });
        } else {
          setIsGeneratingDoOptions(true);
          setOptions((prevOptions) => {
            const newOptions = [...prevOptions].filter(
              (item) =>
                item.type === YunjingServiceChatOutputType.SseDialogOption
            );
            return newOptions;
          });
        }
      }
      let intervalId: NodeJS.Timeout | null = null;
      const accumulatedContent: { [key: string]: string } = {};
      let finishReason: string | null = null;

      try {
        const parser = createParser(
          (event: ParsedEvent | ReconnectInterval) => {
            if (event.type === "event" && event.event !== "stop") {
              const responseData: Response = JSON.parse(event.data);
              if (responseData.code !== 0) {
                const error = new ChatError({
                  code: responseData.code,
                  message: responseData.msg || "",
                });
                throw error;
              }
              if (!responseData.data) return;
              const { optionSlot, content, outputType, messageId } =
                responseData.data;
              console.log("generateOptions content", content);
              if (responseData.data.finishReason === "stop") {
                finishReason = "stop";
              }
              if (!messageId) return;

              const key = `${outputType}-${optionSlot}`;
              if (!accumulatedContent[key]) {
                accumulatedContent[key] = "";
              }
              accumulatedContent[key] += content;

              if (!intervalId) {
                intervalId = setInterval(() => {
                  let anyContentLeft = false;
                  const updatedOptions: any = {}; // 用于记录所有需要更新的内容

                  for (const key in accumulatedContent) {
                    if (accumulatedContent[key]?.length > 0) {
                      console.log(
                        "generateOptions accumulatedContent",
                        key,
                        accumulatedContent[key]
                      );
                      // const currentChar = accumulatedContent[key][0]
                      const currentChar = accumulatedContent[key].slice(
                        0,
                        streamTextLength.current
                      );
                      accumulatedContent[key] = accumulatedContent[key].slice(
                        streamTextLength.current
                      );
                      anyContentLeft = true;

                      const [type, slot] = key.split("-");
                      const slotNumber = parseInt(slot);

                      // 如果这个键还没有记录，则初始化
                      if (!updatedOptions[key]) {
                        updatedOptions[key] = {
                          type,
                          slot: slotNumber,
                          content: "",
                        };
                      }
                      // 更新内容
                      updatedOptions[key].content += currentChar;
                    }
                  }
                  console.log("generateOptions updatedOptions", updatedOptions);

                  if (Object.keys(updatedOptions)?.length > 0) {
                    // 统一更新 options
                    setOptions((prevOptions) => {
                      const newOptions = [...prevOptions];

                      Object.keys(updatedOptions).forEach((key) => {
                        const { type, slot, content } = updatedOptions[key];
                        const option = newOptions.find(
                          (item) =>
                            item.type === type && item.optionSlot === slot
                        );

                        if (option) {
                          const index = newOptions.indexOf(option);
                          newOptions[index] = {
                            ...option,
                            content: option.content + content,
                          };
                        } else {
                          newOptions.push({
                            content: content,
                            optionSlot: slot,
                            type: type,
                            id: messageId,
                          });
                        }
                      });

                      return newOptions.filter(Boolean);
                    });
                  }

                  if (!anyContentLeft) {
                    clearInterval(intervalId!);
                    intervalId = null;

                    if (finishReason === "stop") {
                      if (
                        optionType ===
                          YunjingServiceChatInputType.SseStoryOptionsGen ||
                        (retry &&
                          retryType === YunjingServiceChatInputType.SseRegenDo)
                      ) {
                        setIsGeneratingDoOptions(false);
                      } else {
                        setIsGeneratingSayOptions(false);
                      }
                    }
                  }
                }, timeSpace.current);
              }
            } else if (event.type === "reconnect-interval") {
              console.log(
                "We should set reconnect interval to %d milliseconds",
                event.value
              );
            }
          }
        );

        await getReadableStream(message, parser);
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Request aborted:", error.message);
          return;
        }
        console.error("rawError", error);
        let fatalError = error;
        if (!error.code) {
          fatalError = new ChatError({
            code: ErrorCode.UnknownError,
            message: error.message,
          });
        }
        setOptionsError(fatalError);
        throw fatalError;
      } finally {
        if (!intervalId) {
          if (
            optionType === YunjingServiceChatInputType.SseStoryOptionsGen ||
            (retry && retryType === YunjingServiceChatInputType.SseRegenDo)
          ) {
            setIsGeneratingDoOptions(false);
          } else {
            setIsGeneratingSayOptions(false);
          }
        }
      }
    },
    [
      getReadableStream,
      isBackendGenerating,
      isGeneratingSayOptions,
      isGeneratingDoOptions,
      options,
    ]
  );

  const getIsGenerating = useCallback(() => {
    return ProxyYunjingServiceApiFactory().proxyCheckSceneIsGenerating({
      body: {
        data: {
          sceneId,
        },
      },
    });
  }, [sceneId]);

  const restoreFromHistory = useCallback(async () => {
    console.log("restoreFromHistory");
    const history = await ProxyYunjingServiceApiFactory().getProxySceneHistory({
      body: {
        data: {
          sceneId,
          currDepth: -1,
          count: 10,
        },
      },
    });

    if (!history || !lastMessageRef.current) return;

    const isTheLastIsAssistant = isAssistantOutput(
      lastMessageRef.current?.role
    );

    const index = history.findIndex(
      (item) => item.content === secondLastMessageRef.current?.content
    );

    if (index !== -1) {
      // 历史记录里能找到直接从后端恢复
      const newMessages = history.slice(index + 1).map((item) => ({
        id: item.messageId || "",
        content: item.content || "",
        role: item.role as RoleType,
        timestamp: Date.now(),
        depth: item.depth,
        manual: item.manual || 0,
      }));
      setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      setError(undefined);
    } else {
      setError(undefined);
      if (isTheLastIsAssistant) {
        // 最后一条是用户输入
        setMessages((prev) => prev.slice(0, -2));
        return append({ ...secondLastMessageRef.current! });
      } else {
        // 最后一条是用户输入
        setMessages((prev) => prev.slice(0, -1));
        // 找不到再试一次
        return append({ ...lastMessageRef.current });
      }
    }
  }, [append, sceneId]);

  const getOptionsFromHistory = useCallback(function (
    data: YunjingServiceGetSceneHistory[]
  ) {
    const hasOptions = data?.find((item) => item.role === RoleType.Options);
    if (hasOptions) {
      const actionOptions: Options[] = (hasOptions.actionOptions || [])?.map(
        (item, index) => {
          return {
            content: item,
            type: YunjingServiceChatOutputType.SseStoryOption,
            optionSlot: index,
            id: hasOptions.messageId!,
          };
        }
      );
      const dialogOptions: Options[] = (hasOptions.dialogOptions || [])?.map(
        (item, index) => {
          return {
            content: item,
            type: YunjingServiceChatOutputType.SseDialogOption,
            optionSlot: index,
            id: hasOptions.messageId!,
          };
        }
      );
      const options: Options[] = actionOptions.concat(dialogOptions);
      return options;
    }
    return [];
  },
  []);

  const restoreOptionsFromHistory = useCallback(async () => {
    const history = await ProxyYunjingServiceApiFactory().getProxySceneHistory({
      body: {
        data: {
          sceneId,
          currDepth: -1,
          count: 10,
        },
      },
    });

    if (!history) return;

    const options = getOptionsFromHistory(history);
    if (options?.length) {
      setOptions(options);
    } else {
      await generateOptions();
    }
  }, [generateOptions, getOptionsFromHistory, sceneId]);

  const checkAnyRegenerating = useCallback(async () => {
    const data = await getIsGenerating();
    if (data?.IsGenerating) {
      const lastMessage = lastMessageRef.current;
      if (lastMessage) {
        return append({
          id: "",
          type: YunjingServiceChatInputType.SseSessionReconnect,
          content: "",
          role: RoleType.UserInput,
        });
      }
    } else {
      if (lastMessageRef.current && isUserInput(lastMessageRef.current?.role)) {
        return append({
          ...lastMessageRef.current,
          type: YunjingServiceChatInputType.SseFailureRetry,
        });
      }
    }
  }, [append, getIsGenerating]);

  const retryAfterFailed = useCallback(async () => {
    console.log("retryAfterFailed");
    if (isRetrying.current) return;
    isRetrying.current = true;
    const code = error?.code;

    try {
      if (
        code &&
        ErrorCode.OptionGenerationTimeout <= code &&
        code <= ErrorCode.GetVQAImageFailed
      ) {
        // 后端明确返回了错误
        setError(undefined);
        await append({
          id: "",
          type: YunjingServiceChatInputType.SseFailureRetry,
          content: "",
          role: RoleType.UserInput,
        });
      } else {
        const data = await getIsGenerating();
        if (data?.IsGenerating) {
          const secondLastMessage = secondLastMessageRef.current;
          if (secondLastMessage) {
            setMessages((prev) => prev.slice(0, -2));
            setError(undefined);

            return append({
              ...secondLastMessage,
              id: "",
              type: YunjingServiceChatInputType.SseSessionReconnect,
            });
          }
        } else {
          await restoreFromHistory();
        }
      }
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      isRetrying.current = false;
    }
  }, [append, error?.code, getIsGenerating, restoreFromHistory]);

  const retryOptionsAfterFailed = useCallback(async () => {
    if (isRetryingOptions.current) return;
    isRetryingOptions.current = true;
    try {
      const data = await getIsGenerating();
      setOptionsError(undefined);
      if (data?.IsGenerating) {
        await append({
          id: "",
          type: YunjingServiceChatInputType.SseSessionReconnect,
          content: "",
          role: RoleType.Options,
        });
      } else {
        await restoreOptionsFromHistory();
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      isRetryingOptions.current = false;
    }
  }, [append, getIsGenerating, restoreOptionsFromHistory]);

  const historyRetry = async (id: string, userAutoplayEnabled?: boolean) => {
    const currentMessage = messages.find((item) => item.id === id);
    if (!currentMessage) return;
    if (!isAssistantOutput(currentMessage.role)) {
      console.warn("只允许重写 Assistant");
      return;
    }
    const deleteLength = messages.filter(
      (item) =>
        item.round === currentMessage.round &&
        item.role !== RoleType.UserSendGift &&
        item.role !== RoleType.UserImageInput &&
        item.role !== RoleType.UserInput &&
        item.role !== RoleType.UserStoryInput &&
        item.role !== RoleType.AssistantSendGiftImage
    )?.length;
    setMessages((prev) => {
      const newMessages = [...prev];
      return newMessages.slice(0, newMessages?.length - deleteLength);
    });
    return append({
      id: currentMessage.id,
      content: "",
      role: currentMessage.role,
      type: YunjingServiceChatInputType.SseHistoryRetry,
      sceneType: YunjingServiceSceneType.Default,
    });
  };

  const continueChat = async (role: number, userAutoplayEnabled?: boolean) => {
    console.log(11111111, role);
    if (role !== 1 && role !== 10000) return;
    removeVideoMessage();
    return append({
      id: uuid(),
      content: "",
      role: RoleType.UserInput,
      type: YunjingServiceChatInputType.SseDialogContinue,
      sceneType: YunjingServiceSceneType.Default,
    });
  };

  const sendGiftChat = async (data: {
    content: string;
    imageUrl: ImageUrl;
    giftInfo: YunjingServiceGiftInfo;
  }) => {
    return append({
      id: uuid(),
      content: data.content,
      role: RoleType.UserSendGift,
      type: YunjingServiceChatInputType.SseSendGift,
      sceneType: YunjingServiceSceneType.Default,
      giftInfo: data.giftInfo,
      imageUrl: data.imageUrl,
    });
  };

  const stop = () => {
    abortControllerRef.current?.abort();
    setIsGenerating(false);
    setIsBackendGenerating(false);
    setIsGeneratingSayOptions(false);
    setIsGeneratingDoOptions(false);
    onLocalGenerateStopped?.();
  };

  const handleInputChange = (event: any) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (data: {
    event?: React.FormEvent<HTMLFormElement>;
    role: RoleType;
    value?: string;
    sceneType?: YunjingServiceSceneType;
    audioAutoPlay?: boolean;
  }) => {
    const { role } = data;
    const currentValue = data.value || input;
    if (data?.event) {
      data?.event.preventDefault();
    }

    setInput("");

    if (!currentValue.trim()) return;

    const userMessage: CreateMessage = {
      content: currentValue,
      role: role,
      type:
        role === RoleType.UserInput
          ? YunjingServiceChatInputType.SseDialogInput
          : YunjingServiceChatInputType.SseStoryInput,
      sceneType: data.sceneType,
      // audioAutoPlay: data?.audioAutoPlay,
    };

    return append(userMessage);
  };

  const handleGroupChatUpdate = async (
    characters: YunjingServiceSceneChatRequest["characters"]
  ) => {
    let isAdding = false;
    return append({
      content: `${characters?.map((character) => {
        isAdding =
          character.operation === YunjingServiceGroupCharacterOperation.Adding;
        return `@${character.charName}`;
      })} ${
        isAdding
          ? t("group_chat_character_appeared")
          : t("group_chat_character_left")
      }`,
      role: RoleType.UserStoryInput,
      type: YunjingServiceChatInputType.SseStoryInput,
      sceneType: YunjingServiceSceneType.Group,
      characters,
    });
  };
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    /**
     * 选项列表，包含普通和剧情
     */

    options,
    setOptions,
    error,
    setError,
    /**
     * 选项生成异常
     */
    optionsError,
    setOptionsError,
    messages,
    append,
    historyRetry,
    retryAfterFailed,
    retryOptionsAfterFailed,
    stop,
    setMessages,
    input,
    setInput,
    handleInputChange,
    /**
     * 表单提交
     */
    handleSubmit,
    /**
     * 群聊操作
     */
    handleGroupChatUpdate,
    generateOptions,
    /**
     * 聊天生成中, setMessages 在触发
     */
    isGenerating,
    /**
     * 聊天生成中, 后端是否正在生成，先于 isBackendGenerating
     */
    isBackendGenerating,
    /**
     * 选项生成中
     */
    isGeneratingSayOptions,
    isGeneratingDoOptions,
    getIsGenerating,
    checkAnyRegenerating,
    /**
     * 继续对话
     */
    continueChat,
    /**
     * 送礼
     */
    sendGiftChat,
    removeVideoMessage,
  };
};

export { useChat };
