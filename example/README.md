# How to run Example / [Live Demo](http://redux-auto.s3-website-eu-west-1.amazonaws.com/)

1) `npm install redux-auto`
2) `cd node_modules/redux-auto/example/`

once you are in the "example" folder and run the following commands

3) `npm install`
4) `npm start`

then open a web brower to http://localhost:1337

----

Project structure:
```
example/
├── store/
│   ├──user/
│   │  └── index.js
│   │  └── changeName.js
│   │  └── init.js
│   └──posts/
│      └── index.js
│      └── delete.js
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
