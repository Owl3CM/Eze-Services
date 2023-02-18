import React from "react";
import { RecyclerList } from "../RecyclerList";
import "../css/index.css"
import Utils from "../Utils";
import { ApiService, CashService, Grid } from "../index";
// import { PagenationService } from "../Services";
document.documentElement.className="dark"
const ItemCard = ({ item }) => {
    return (
        <div className="item-card">
            <div>{item.name}</div>
            <div>{item.description}</div>
            <div>{item.wholeSalePrice}</div>
            <div>{item.morabaaId}</div>
        </div>
    );
};

const MockItemsGenerator = (count, items = []) => {
    console.log({ApiService});
    count += items.length;
    const generateWords = (count) => {
        let words = [];
        for (let i = 0; i < count; i++) {
            words.push(`word ${i}`);
        }
        return words;
    };

    for (let i = items.length; i < count; i++) {
        items.push({
            i,
            id: i,
            name: `Item ${i}`,
            description: `Description ${i}`,
            name: `name ${i}`,
            wholeSalePrice: `wholeSalePrice ${i}`,
            morabaaId: `morabaaId ${i}`,
            // test: generateWords(Math.random() * 100),
        });
    }
    return items;
};
const viewedItems = 25;
const fromApi = false;
const RecyclerTest = () => {

    const service = React.useMemo(() => {
    const test = new ApiService({

    });    
        const _service = 
            //fromApi
            // ? new PagenationService()
            // :
             {
                  items: MockItemsGenerator(viewedItems),
                  canFetch: true,
                  loadMore: async () => {
                      service.canFetch = false;
                      console.log("load more");
                      await Utils.sleep(500);
                      service.items = MockItemsGenerator(viewedItems, service.items);
                      console.log("loaded");
                      service.canFetch = service.items.length <120;// true;
                     return true;
                  },
                  search: () => {
                      console.log("search");
                  },
              };
        _service.search();
        return _service;
    }, []);
    [service.items, service.setItems] = React.useState(service.items);
    console.log("init service");

    return <RecyclerList  service={service} itemBuilder={ItemCard} viewedItems={viewedItems}   />;
};

export default RecyclerTest;
