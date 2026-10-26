# Front Door: Issue Log

Every problem found while building this site, how it was caught, and how it was fixed.

**How issues were caught**

* **Visual check:** screenshots at phone (390px) and desktop (1440px) sizes after each change
* **Code review:** reading the code back for bugs and shortcuts
* **Automated check:** a Playwright script that tests the behavior in a real browser
* **Test suite:** the Playwright tests in `tests/` (behavior, axe accessibility scans, visual comparison)

## Fixed

**#1 Phone hero photo rendered 800px tall**
Found by: visual check (first version)
Problem: The photo pushed the headline and buttons off the first phone screen.
Cause: The image had width and height attributes but no `height: auto` in CSS.
Fix: Added `height: auto` with a fixed aspect ratio.

**#2 Design option screenshots cut off on desktop**
Found by: visual check (design options B and C)
Problem: Price labels wrapped awkwardly and the day picker was clipped.
Fix: Put prices on their own line and gave the day picker five equal columns.

**#3 "Call(805)" missing a space**
Found by: visual check
Cause: Flexbox buttons drop the space between text and a nested element.
Fix: Added `gap: 6px` to all buttons.

**#4 "With an agent" wrapped to two lines on phones**
Found by: visual check
Fix: Shortened the label to "With agent" in both property files.

**#5 Tour times in the past were still offered**
Found by: code review
Problem: At 6 pm, the site still offered a 3:00 pm tour for today.
Fix: Today's list only shows times later than now. If none are left, it says so.
Verified: Automated check with the browser clock set to 6:40 pm.

**#6 Headline unreadable on bright photos** (accessibility)
Found by: code review, confirmed by automated check
Problem: White text had nothing behind it, so a bright photo would make it disappear.
Fix: Dark fade behind the hero text.
Follow up: The first fade was too light. The check on a near white photo showed the top line was still faint, so the fade was made stronger and taller.
Verified: Before and after screenshot on a near white photo.

**#7 Max rent options were hard coded**
Found by: code review
Problem: "$2,500" made no sense for Harborview, where rent starts at $2,550. This broke the template idea.
Fix: Options are now built from each property's own prices in $500 steps.
Verified: Automated check on both properties.

**#8 A mistyped property name showed a blank page**
Found by: code review
Problem: `?property=harbr` loaded nothing.
Fix: Names are checked, unsafe names like `../` are blocked, and missing files fall back to the default property with a clear warning.
Verified: Automated check with a typo and with `../`.

**#9 Some colors were outside the theme**
Found by: code review
Problem: A few colors were written directly in `site.css`, so a new brand would look slightly off.
Fix: Moved them into theme variables.
Follow up: The automated check found six more spots where button text was hard coded white. That would break for a brand with a light color like yellow. Added an `--on-brand` variable.
Verified: Automated scan finds no colors left in `site.css`.

**#22 Day buttons failed WCAG 2.5.3 (Label in Name)** (accessibility)
Found by: test suite, axe scan, on its first run
Problem: The buttons show "Tue 27" but told screen readers "Tuesday, October 27". A voice control user saying "click Tue 27" would not match the button.
Fix: The visible text stays in the button's name. The full date is added as hidden extra text for screen readers.
Verified: axe scans pass on both properties, desktop and phone.

**#23 The screenshot test was too forgiving**
Found by: testing the test. A shared CSS change was made on purpose to see if the suite would catch it.
Problem: The change turned Harborview's pill buttons square, but the test still passed. It allowed 1% of pixels to differ, and 1% of a full page is about 60,000 pixels.
Fix: The limit is now 100 pixels.
Verified: The same change now fails on Harborview, desktop and phone, with a picture of the difference in the report.

**#24 Fonts loaded from Google**
Found by: setting up screenshot tests
Problem: The page depended on Google Fonts. Screenshots could differ between machines, and the site looked different offline.
Fix: Fonts are now stored in the project (`vendor/fonts`).

**#25 Firefox tests time out under full parallel load**
Found by: test suite, running `npm test` on a Mac
Problem: When all five browser projects run at once, a different Firefox test times out each time (never the same one, never a content check, always a click or teardown timeout). Every failing test passes cleanly on its own.
Cause: Local machine runs out of CPU headroom with five browsers going at once, and Firefox is the one that runs short first. Not a site bug.
Verified: Same `npm test` run three times in a row. Each time, only desktop Firefox failed, with a different test. Isolated reruns of every failing test passed.

## Open

**#10 Gold location label is faint on very bright photos**
The small "GOLETA, CALIFORNIA" label is readable but low contrast in the worst case. Option: switch it to white on the hero.

**#11 Page is empty without JavaScript**
Search engines and users with JavaScript off see an empty page first. A production version would build the finished HTML ahead of time.

**#12 Card HTML is built with string concatenation**
Hard to read and edit. Option: move card markup into HTML `<template>` tags.

**#13 Availability dates are stored as text**
"Nov 15" can be shown but not filtered. Option: store real dates and bring back a move in date filter.

**#14 Full Bootstrap is loaded for two features**
Only the menu and slide up panel are used. Option: load just those parts to speed up the page.

**#15 Photos need multiple sizes**
Once real photos are added, phones should get smaller files using `srcset`.

**#16 Tour booking stops at the time picker**
The next step (name, phone, email, validation) is not built yet.

**#17 No automated test suite yet** (done)
Added a Playwright suite in `tests/`: behavior tests, axe scans and visual comparison, in Chrome, Firefox and Safari, run on GitHub on every push. Firefox and Safari runs happen on GitHub and on your own computer.

## Planned: running it for many properties

**#18 Content can only be edited in code**
Leasing staff should not need to open a JavaScript file to change a special or a photo. Plan: an admin screen that edits the property file. The file is already shaped like the data behind a form, so this is a natural next step.

**#19 Prices and availability are typed in by hand**
Hand typed prices drift out of date. Plan: pull floor plans, prices and availability from the property management software through an API, so the website always matches the leasing office. Depends on #13 (real dates).

**#20 One template change can break every site** (done)
Because all properties share the same code, a small CSS change could break hundreds of sites at once. Now every theme is screenshotted at phone and desktop sizes and compared to its last approved version, plus axe scans, on every push. Proven by #23: a button tweak in shared CSS was caught on Harborview.

**#21 No version history for themes**
If a client dislikes a new look, there is no easy way back. Plan: keep each theme in Git so any change can be reviewed and rolled back.
