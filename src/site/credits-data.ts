/**
 * Every picture on the site that is not our own, with its credit: listed once, in the Impressum
 * (Picture credits), and linked from every footer. The globe also credits its map on the globe itself,
 * as EOX asks. See README → Images and their rights.
 */
export interface PictureCredit {
    picture: string;
    /** The picture's own page. */
    source?: string;
    by: string;
    licence?: string;
    licenceUrl?: string;
    /** What we changed, as the licences ask us to say. */
    change?: string;
    /** Where it appears. */
    pages: string;
}

const CC_BY_3 = 'https://creativecommons.org/licenses/by/3.0/';
const CC_BY_4 = 'https://creativecommons.org/licenses/by/4.0/';
const CC_BY_SA_IGO = 'https://creativecommons.org/licenses/by-sa/3.0/igo/';
const CC0 = 'https://creativecommons.org/publicdomain/zero/1.0/';
const FAL = 'https://artlibre.org/licence/lal/en/';

export const PICTURE_CREDITS: PictureCredit[] = [
    {
        picture: 'Vulcain 2 on test stand P5, DLR Lampoldshausen',
        source: 'https://www.dlr.de/en/images/2011/3/vulcain-2-engine-on-test-facility-p5-at-dlr-lampoldshausen_3149',
        by: 'DLR',
        licence: 'CC BY 3.0',
        licenceUrl: CC_BY_3,
        change: 'cropped',
        pages: 'Home',
    },
    {
        picture: 'Vinci engine in test stand P4.1',
        source: 'https://www.dlr.de/de/bilder/2016/2/vinci-triebwerk-im-pruefstand-p4-1_23249',
        by: 'DLR',
        licence: 'CC BY 3.0',
        licenceUrl: CC_BY_3,
        change: 'cropped and resized',
        pages: 'Home, Method',
    },
    {
        picture: 'Aestus engine in test stand P4.2',
        source: 'https://www.dlr.de/de/bilder/2016/4/triebwerkstests-beim-dlr_25044',
        by: 'DLR',
        licence: 'CC BY 3.0',
        licenceUrl: CC_BY_3,
        change: 'cropped',
        pages: 'Home, Company',
    },
    {
        picture: 'EJ200 afterburner',
        source: 'https://commons.wikimedia.org/wiki/File:Afterburner_Eurojet_EJ200_turbofan_engine_for_Eurofighter_Typhoon_ILA_Berlin_2016_01.jpg',
        by: 'Julian Herzog',
        licence: 'CC BY 4.0',
        licenceUrl: CC_BY_4,
        change: 'cropped',
        pages: 'Home, Company',
    },
    {
        picture: 'Wendelstein 7-X wall tiles',
        source: 'https://commons.wikimedia.org/wiki/File:W7-X_tile_installation.jpg',
        by: 'Christopher Roux, EUROfusion',
        licence: 'CC BY 4.0',
        licenceUrl: CC_BY_4,
        change: 'cropped',
        pages: 'Home, Company',
    },
    {
        picture: 'Tungsten crystals',
        source: 'https://commons.wikimedia.org/wiki/File:Wolfram_evaporated_crystals_and_1cm3_cube.jpg',
        by: 'Alchemist-hp (pse-mendelejew.de)',
        licence: 'Free Art License 1.3',
        licenceUrl: FAL,
        change: 'cropped',
        pages: 'Home, Company',
    },
    {
        picture: 'PTFE lab parts',
        source: 'https://commons.wikimedia.org/wiki/File:Teflon_items.jpg',
        by: 'Cjp24',
        licence: 'public domain',
        change: 'cropped',
        pages: 'Home, Company',
    },
    {
        picture: 'A 300 mm test wafer',
        source: 'https://commons.wikimedia.org/wiki/File:Wafer300mm-LargeIC-testset.jpg',
        by: 'ISCIX-Ex',
        licence: 'CC0 1.0',
        licenceUrl: CC0,
        change: 'cropped',
        pages: 'Home, Company',
    },
    {
        picture: 'Europe from Envisat',
        source: 'https://www.esa.int/ESA_Multimedia/Images/2010/09/MERIS_mosaic_of_Europe',
        by: 'ESA',
        licence: 'CC BY-SA 3.0 IGO',
        licenceUrl: CC_BY_SA_IGO,
        change: 'resized',
        pages: 'Home, where the globe cannot be drawn',
    },
    {
        picture: 'The Earth without clouds (EOxCloudless 2016)',
        source: 'https://cloudless.eox.at',
        by: 'EOX IT Services GmbH, containing modified Copernicus Sentinel data 2016',
        licence: 'CC BY 4.0',
        licenceUrl: CC_BY_4,
        change: 'wrapped around the globe',
        pages: 'Home',
    },
    {
        picture: 'Fruit-fly brain wiring map (MaleCNS v1.0)',
        by: 'FlyEM, HHMI Janelia',
        licence: 'CC BY 4.0',
        licenceUrl: CC_BY_4,
        pages: 'Method',
    },
    {
        picture: 'Team PRISM at the Hessen Ideen awards',
        by: 'Hessen Ideen',
        pages: 'Home, News',
    },
];
