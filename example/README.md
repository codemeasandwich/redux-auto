# How to run Example

`cd` in this "example" folder and run the following commands

1) `npm install`
2) `npm start`

then open a web brower to http://localhost:1337

----

Project structure:
```
example/
├── store/
│   └──user/
│      └── index.js
│      └── changeName.js
│      └── init.js
├── ui/
│   └──index.jsx
└── ...
└── main.jsx
```

Store structure:

* each **folder** represents an attribute on a store
    * each **file** within the folder representing action
    * *index* & *init* are special files
        * index: sets the default values & catches all actions that do not directly map to a file
        * init: automatically run once after store created