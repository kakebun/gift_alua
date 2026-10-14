# POV: You're a Roman Legionary (тестовый ролик)

Длительность около 2:10, формат 1920×1080, 24 fps. Озвучка на английском, синтезированный голос.

| # | Сцена | Что в кадре | Текст (озвучка) |
|---|-------|-------------|-----------------|
| 1 | Вступление | Золотой портал, герой с песочными часами. Часы переворачиваются, вспышка, и герой уже в доспехах легионера. Камера влетает в портал. | Today, you are a Roman legionary. The year is one hundred AD, and the empire is at its peak. Let's see how long you survive. |
| 2 | Палатка | Крупный план: герой спит. Рог «ТУУУТ!», герой просыпается. Отъезд камеры: рядом спят ещё 7 солдат, над ними появляются цифры 1–7, соседи сдавливают героя. | You wake up before sunrise. Somewhere outside, a horn blasts. You share this tiny leather tent with seven other guys. Yes. Seven. Personal space hasn't been invented yet. |
| 3 | Завтрак | Котёл на огне. Герой ест «PULS» (кашу) и кривится, потом пьёт «POSCA» и передёргивается. Появляются надписи «Delicious? NO.» и «Free? ALSO NO.», монетка улетает. | Breakfast is puls… posca… Your food comes out of your pay. |
| 4 | Снаряжение | На героя падают шлем, доспех, щит, 2 пилума, меч и рюкзак. Шкала веса растёт до 30 кг, ноги дрожат. Въезжает мул: «Marius's Mules». | Then comes the gear… around thirty kilograms… Marius's mules. |
| 5 | Марш | Параллакс-пейзаж, легионеры идут, счётчик 0→30 км и 5 ч, жара. Сзади центурион с палкой из виноградной лозы: «WHACK!» | Now, you march… and he is not afraid to use it. |
| 6 | Лагерь | Мечта об отдыхе лопается, центурион бросает лопату. Ускоренная съёмка: ров, вал, частокол, закат, схема лагеря (CASTRA). Перемотка назад: «REPEAT. EVERY. DAY.» | Finally, you stop… do it again. |
| 7 | Жалованье | Гора монет «300 denarii / year», свиток вычетов (Food, Boots, Equipment, Burial fund). Монеты улетают, у героя остаётся одна. | Your pay?… Even a burial fund, just in case. |
| 8 | Ночь | Звёзды и костёр. Отметки боли: ноги, спина, всё тело. «25 YEARS». Мечта о награде: деньги и ферма. | At night… Maybe… it's worth it. |
| 9 | Финал | «Would YOU survive?», карточка комментария, «SUBSCRIBE :)», курсор нажимает на кнопку. | Would you survive…? Tell me in the comments. And subscribe… |

Исторические факты в ролике: контуберний из 8 человек в одной палатке; puls и posca; около 30 кг снаряжения и прозвище «мулы Мария»; около 20 римских миль (≈30 км) за 5 часов по Вегецию; vitis, жезл центуриона из виноградной лозы; укреплённый лагерь каждый вечер на марше; жалованье 300 денариев при Домициане/Траяне и вычеты из него; 20 лет службы плюс 5 в резерве, то есть около 25 лет; награда при отставке (praemia) деньгами или землёй.

## Как пересобрать ролик

```
python3 tts.py <папка с моделью kokoro>   # озвучка -> build/vo
python3 timeline.py                        # тайминг сцен по длине фраз
node render.js 24 3                        # кадры -> build/video.mp4 и build/cues.json
python3 mix.py                             # музыка, эффекты и голос -> build/audio.wav
ffmpeg -i build/video.mp4 -i build/audio.wav -af loudnorm=I=-14:TP=-1.5 -c:v copy -c:a aac -b:a 192k -shortest out.mp4
```
