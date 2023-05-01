export default class Mock {
    constructor() {}
    static GenerateItem = (i = 0) => {
        return {
            i,
            id: i,
            description: `Description ${i}`,
            name: `name ${i}`,
            wholeSalePrice: `wholeSalePrice ${i}`,
            morabaaId: `morabaaId ${i}`,
            words: Mock.GenerateWords(Math.random() * 100),
        };
    };
    static GenerateItems = (limit = "25", offset = "0", endpoint = "") => {
        let _offset = parseInt(offset) || 0;
        let _limit = parseInt(limit) + _offset;
        console.log({ _limit, _offset, endpoint });
        let items = [];
        const _data = (_DATA as any)[endpoint] || _DATA["random"];
        for (let i = _offset; i < _limit; i++) {
            items.push(_data(i));
        }
        return items;
    };

    static GenerateWords = (count = 3) => {
        const _words = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.".split(" ");
        let words = [];
        for (let i = 0; i < count; i++) {
            words.push(_words[Math.floor(Math.random() * _words.length)]);
        }
        return words.join();
    };
}

const _DATA = {
    "test/patients": (i: number) => {
        const pation = {
            name: getName(),
            phoneNumber: "09123456789",
            gender: Math.random() > 0.5 ? 1 : 0,
            birthDate: new Date(),
            additionalData: {
                // [key: string]: TemplateControls[];
            },
            imageId: persionsImagesIds[Math.floor(Math.random() * persionsImagesIds.length)],
            address: Addresses[Math.floor(Math.random() * Addresses.length)],
        };
        return pation;
    },
    random: Mock.GenerateItem,
};

interface Patient {
    id: string;
    name: string;
    phoneNumber: string;
    gender: number;
    birthDate: Date;
    additionalData: {
        // [key: string]: TemplateControls[];
    };
    imageId: string | null;
    date: string;
    genderTitle: string;
    address: string;
    notes: string;
}

interface PatientResponse extends Patient {
    createdBy: string;
    updatedBy: string;
    isUpdated: true;
    createdAt: Date;
    updatedAt: Date;
    balances: {
        [key: string]: number;
    };
    credits: {
        [key: string]: number;
    };
    debits: {
        [key: string]: number;
    };
}

export type { Patient, PatientResponse };

// export const EmptyPatientRequest: Patient = {
//     name: "",
//     phoneNumber: "",
//     gender: 0,
//     birthDate: new Date(),
//     additionalData: {},
//     imageId: null,
// };

const persionsImagesIds = [
    "https://t3.ftcdn.net/jpg/02/33/46/24/360_F_233462402_Fx1yke4ng4GA8TJikJZoiATrkncvW6Ib.jpg",
    "https://c8.alamy.com/zooms/9/ff8842a552e64e1a92be1657e1cf08af/taf8ng.jpg",
    "https://cdn4.vectorstock.com/i/1000x1000/46/73/person-gray-photo-placeholder-man-material-design-vector-23804673.jpg",
    "https://st3.depositphotos.com/9998432/13335/v/450/depositphotos_133352010-stock-illustration-default-placeholder-man-and-woman.jpg",
    "https://st3.depositphotos.com/9998432/13335/v/450/depositphotos_133352010-stock-illustration-default-placeholder-man-and-woman.jpg",
];

const Addresses = ["النجف", "الكوفة", "الحلة", "البصرة", "الموصل", "السليمانية", "السماوة", "الناصرية", "بغداد", "كربلاء"];

const getName = () => {
    return Names[Math.floor(Math.random() * Names.length)] + " " + Names[Math.floor(Math.random() * Names.length)];
};

const Names = [
    "احمد",
    "محمد",
    "علي",
    "عباس",
    "حسين",
    "عبدالله",
    "عبدالرضا",
    "عبدالامير",
    "عبدالجبار",
    "عبدالحسين",
    "عبدالوهاب",
    "عبدالكريم",
    "عبدالمهدي",
    "عبدالرحمن",
    "عبدالعزيز",
    "عبدالستار",
    "عبدالرزاق",
    "عبدالمجيد",
    "عبدالحميد",
    "عبدالجليل",
    "عبدالفتاح",
    "عبدالحفيظ",
    "عبدالمنعم",
    "عبدالمطلب",
    "عبدالملك",
    "عبدالرحيم",
    "عبدالباسط",
    "عبدالحق",
    "عبدالحكيم",
    "عبدالعظيم",
    "عبدالعزيز",
    "عبدالعفو",
    "عبدالعليم",
    "عبدالعالي",
];
