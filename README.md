# Livesheet

An app to display chord charts and lyrics for live performances.


## Songs

Song charts are translated into HTML so they can be displayed and stylized in a web browser.

Songs need to be specifically formatted as follows:

```
Title
  author: John Doe, Jane Doe
  key: C
  tempo: 128
  time: 4/4
  
  verses: A B C  D E F
  chorus: D E F  A B C
  bridge: G A B  C D E

Sections:
  Verse 1:
    ^Some lyrics ^are here
    ^carets are ^where chords ^go
    ^oh
  
  Chorus:
    ^If the ^section name starts with the ^same word as the section in the ^chord chart ^(after the title)
    it will use those chords in the ^section

  Verse 2:
    ^For example, all ^verses will all
    ^use the same chords, and chord-naming is ^pretty flexible.
    ^You can even use ^Nashville numbering.
  
  Bridge:
    ^Don't forget the colons, ^they're important.
    And if you have more carets than chords, it will just start at the beginning of the chord chart and keep going.

Arrangements:
  Live:
    Verse 1
    Chorus
    Verse 2
    Chorus
    Bridge
  
  Studio:
    Verse 1
    Verse 2
    Chorus
    Verse 1
    Chorus
    Bridge
    Chorus
```

...there will always be a _default_ arrangement which displays the sections in the order they are given.


## Sets

A set is a collection of songs/arrangements