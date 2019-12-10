const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const Router = require("koa-router");
const fs = require("fs");
const path = require("path");

const app = new Koa();
const router = new Router();
app.use(bodyParser());

router.get("/", async ctx => {
  ctx.body = "hello world";
});

const writeJson = ({ id, params, filename }) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, filename), (err, data) => {
      if (err) {
        // 报错返回
        resolve({ code: -1, msg: "新增失败" + err });
        return console.error(err);
      }

      let jsonData = data.toString();
      jsonData = JSON.parse(jsonData);

      // 有id值 => 修改 无id值 => 新增
      if (id) {
        jsonData.splice(
          jsonData.findIndex(item => item.id === id),
          1,
          params
        );
      } else {
        // 有重复 => 返回-1 无重复 => 将params加到json数组末尾
        let hasRepeat = jsonData.find(item => item.id === params.id);
        if (!!hasRepeat) {
          resolve({ code: -1, msg: "新增失败，有重复项目id" });
        } else {
          jsonData = [...jsonData, params];
        }
      }

      let str = JSON.stringify(jsonData);
      fs.writeFile(path.join(__dirname, filename), str, err => {
        if (err) {
          resolve({ code: -1, msg: "新增失败" + err });
        }
        resolve({ code: 0, msg: "新增成功" });
      });
    });
  });
};

const deleteJson = ({ id, filename }) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, filename), (err, data) => {
      if (err) {
        resolve({ code: -1, msg: "删除失败" + err });
        return console.error(err);
      }

      let jsonData = data.toString();
      jsonData = JSON.parse(jsonData);
      jsonData = jsonData.filter(item => item.id != id);

      let str = JSON.stringify(jsonData);
      fs.writeFile(path.join(__dirname, filename), str, err => {
        if (err) {
          resolve({ code: -1, msg: "删除失败" + err });
        }
        resolve({ code: 0, msg: "删除成功" });
      });
    });
  });
};

const findJson = ({ id, filename }) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, filename), (err, data) => {
      if (err) {
        resolve({ code: -1, msg: "查询失败" + err });
        return console.error(err);
      }

      let jsonData = data.toString();
      jsonData = JSON.parse(jsonData);

      if (id) {
        jsonData = jsonData.filter(item => item.id === id);
        resolve({ code: 0, data: jsonData });
      } else {
        resolve({ code: 0, data: jsonData });
      }
    });
  });
};

// 路由
const nominate = new Router();
const file1 = "data/nominate.json";

// 新增和修改
nominate.post("/save", async ctx => {
  let id = ctx.request.body.id;
  let params = ctx.request.body.params;
  // 返回给前端
  ctx.body = await writeJson({ id, params, filename: file1 });
});

// 删除
nominate.get("/delete", async ctx => {
  let id = ctx.request.query.id;
  ctx.body = await deleteJson({ id, filename: file1 });
});

// 查找
nominate.get("/find", async ctx => {
  let id = ctx.request.query.id;
  ctx.body = await findJson({ id, filename: file1 });
});

// 装载所有子路由
router.use("/nominate", nominate.routes(), nominate.allowedMethods());
app.use(router.routes()).use(router.allowedMethods());
app.listen(3000);
