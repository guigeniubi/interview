class Restaurant {
    constructor() {
        this.menuData = {};
    }
    // 获取菜品
    getDish(dish) {
        if (!this.menuData[menu]) {
            console.log("菜品不存在，获取失败");
            return;
        }
        return this.menuData[menu];
    }
    // 添加菜品
    addMenu(menu, description) {
        if (this.menuData[menu]) {
            console.log("菜品已存在，请勿重复添加");
            return;
        }
        this.menuData[menu] = menu;
    }
    // 移除菜品
    removeMenu(menu) {
        if (!this.menuData[menu]) {
            console.log("菜品不存在，移除失败");
            return;
        }
        delete this.menuData[menu];
    }
}

class Dish {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }

    eat() {
        console.log(`I'm eating ${this.name},it's ${`this.description);
    }
}
