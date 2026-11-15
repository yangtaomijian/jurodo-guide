---
title: "D4 午休"
subtitle: "7月31日（四） · 雨"
---

::: {.day-pager aria-label="页首切换午休" role="navigation" data-page-lookup="从午休开始"}
[← D3](d3-lunch.md){.day-previous aria-label="上一个午休 D3"} [<span class="bi bi-calendar3" aria-hidden="true"></span> 午休日历](lunch-calendar.md){.day-directory} [D5 →](d5-lunch.md){.day-next aria-label="下一个午休 D5"}
:::

::: {.guide-jumps aria-label="午休导航" role="navigation"}
[返回 D4 日期页](d4.md#lunch) [选完怎么补](#revisit) [GP 的加减规则](../mechanics/gp.md#balance)
:::

```{=html}
<nav class="lunch-places" aria-label="有选项、成就或前置的地点">
  <a href="#site-lower">
    <strong>现场下层</strong>
    <span>偏右下 · 斗次郎 · 2 项</span>
    <small>一起午睡 −12 GP · 成就</small>
  </a>
  <a href="#restroom">
    <strong>厕所</strong>
    <span>左下偏中 · 文治 · 2 项</span>
    <small>问答前自动成就 · 地点奖 +8 GP</small>
  </a>
  <a class="lunch-prerequisite" href="#gate">
    <strong>大门前</strong>
    <span>最右侧 · 狸丸在场时，读完登记番外前置并得 +8 GP</span>
  </a>
</nav>
```

时间线选「从午休开始」。现场下层和厕所的地点奖各 **+8 GP**，读完到账。北野门左卫门的付费问答在[午休地图之前](d4.md#kitanomon)。

## [现场下层]{.lookup-name} {#site-lower data-lookup="工地下层 斗次郎 偏右下 午睡"}

偏右下 · 斗次郎 · 地点奖 **+8 GP**

::: {.choice-list data-place="现场下层"}
::: {#leave-tojiro .choice-row data-lookup="老老实实离开这里 斗次郎 挤塑板 午睡"}
[乖乖离开]{.lookup-name} [+4 GP]{.gp-in}

斗次郎叫住主角，给他一块挤塑板，让他在旁边打盹。
:::

::: {#nap-with-tojiro .choice-row data-lookup="和斗次郎一起同床小憩 与斗次郎一起午睡休息 #393"}
[和斗次郎一起睡]{.lookup-name} [−12 GP]{.gp-out}

两人背靠背午睡，读到收尾取得成就「[与斗次郎一起午睡休息](../collectibles/achievements.md#a393){.achievement-ref}」，再领地点奖。
:::
:::

## [厕所]{.lookup-name} {#restroom data-lookup="左下偏中 文治 在厕所里吓到了文治 在厕所里吓了文治一跳 #394"}

左下偏中 · 文治 · 地点奖 **+8 GP**

::: {.event-record}
主角进厕所吓到文治。成就「[在厕所里吓到了文治](../collectibles/achievements.md#a394){.achievement-ref}」在问答前自动登记，两项任选。读完对话再领地点奖。
:::

### 那来干什么…… {#restroom-question}

::: {.choice-list data-place="厕所"}
::: {#use-restroom .choice-row data-lookup="来大便的 文治 厕所"}
[来大便]{.lookup-name} [+4 GP]{.gp-in}

文治催主角进隔间，之后问他最近怎么样。
:::

::: {#watch-bunji .choice-row data-lookup="来看你站着撒尿的样子 文治 厕所"}
[来看站着撒尿]{.lookup-name}

文治觉得主角的回答莫名其妙，随后也会问起近况。这项本身是 **0 GP**，地点奖照常。
:::
:::

## [大门前]{.lookup-name} {#gate data-lookup="最右侧 狸丸 狸丸的秘密 #356 前置"}

最右侧 · 狸丸

::: {.event-record}
狸丸在场时，主角会邀请他进值班室避雨。读到收尾可领 **+8 GP**，并登记一次「狸丸的秘密」所需的拜访。

狸丸离开后，这里会回午休地图，0 GP，当次也无法补这笔记录。[番外入口的显示条件](../mechanics/timeline.md#percent)
:::

<details class="kt-read-more">
<summary>其他四处 · 值班室、事务所各 +8 GP，两处空地点记完成度</summary>

::: {.choice-list}
::: {#guardroom .choice-row data-lookup="工棚 值班室 熊手 笹吉 北野门左卫门 左下"}
[值班室]{.lookup-name} [+8 GP]{.gp-in}

左下。和熊手、笹吉、北野门左卫门一起闲聊。
:::

::: {#office .choice-row data-lookup="办公室 事务所 监督 资料 左侧"}
[事务所]{.lookup-name} [+8 GP]{.gp-in}

左侧靠边。监督给主角看现场资料，聊施工团队。
:::

::: {#site-upper .choice-row data-lookup="工地上层 中央偏上 雨 空地点"}
[现场上层]{.lookup-name}

中央偏上。下雨，没人。记地点完成度，回地图，0 GP。
:::

::: {#materials .choice-row data-lookup="材料堆放处 雨 右下 空地点"}
[材料存放处]{.lookup-name}

右下。下雨，没人。记地点完成度，回地图，0 GP。
:::
:::

</details>

## 选完后怎么补 {#revisit}

- 平常的午休里，有人在的地点读完就接下午工作，空地点会回地图。离开后可从[「从午休开始」](../mechanics/timeline.md#back-to-d4)补。
- 解锁[「无限午休功能」](../mechanics/gp.md#features)后，读完可以回地图再选地点。逛完点右侧的「午休结束」。回原处可补另一项，已登记的成就保留。

::: {.day-pager .day-pager-footer aria-label="页尾切换午休" role="navigation"}
[← D3](d3-lunch.md){.day-previous aria-label="上一个午休 D3"} [<span class="bi bi-calendar3" aria-hidden="true"></span> 午休日历](lunch-calendar.md){.day-directory} [D5 →](d5-lunch.md){.day-next aria-label="下一个午休 D5"}
:::
