import { shallowMount, mount, createLocalVue } from '@vue/test-utils';
import { describe, it, expect } from '@jest/globals';
// Why is VueRouter undefined?
// import VueRouter from 'vue-router';
const VueRouter = require('vue-router');
import Anchor from '../src/anchor';

const localVue = createLocalVue();
localVue.use(VueRouter);

describe('Anchor', () => {
    it('Empty options should be generated before registration.', () => {
        const wrapper = shallowMount({
            template: '<div></div>',
        });
        const anchor = new Anchor(wrapper.vm);
        expect(Object.keys(anchor.options).length).toBe(0);
    });

    it('The changed the `key` value of a basic type should be bound to `$route.query[key]`.', async() => {
        const app = {
            template: '<div></div>',
            data() {
                return {
                    name: 'anchor',
                    count: 1,
                    big: BigInt(12345678987654321),
                    flag: false,
                    dynamic: 'dynamic',
                };
            },
            anchor: ['name', 'count', 'big', 'flag', 'dynamic'],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        // change string value
        wrapper.vm.$data.name = 'changed-anchor';
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.name)).toBe('changed-anchor');

        // change number value
        wrapper.vm.$data.count = 2;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.count)).toBe(2);

        // change bigint value
        const value = BigInt(123456789876543210);
        wrapper.vm.$data.big = value;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.big)).toEqual(value);

        // change boolean value
        wrapper.vm.$data.flag = true;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.flag)).toBeTruthy();

        // change to undefined value
        wrapper.vm.$data.dynamic = undefined;
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$route.query.dynamic).toBe('-');

        // change to null value
        wrapper.vm.$data.dynamic = null;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query.dynamic)).toBeNull();
    });

    it('The `key` value of the property of the changed object should be bound to `$route.query[key]`.', async() => {
        const app = {
            template: '<div></div>',
            data() {
                return {
                    params: {
                        pageNum: 1,
                    },
                };
            },
            anchor: ['params.pageNum'],
        };
        const router = new VueRouter({ routes: [{ path: '/', component: app }] });
        const wrapper = mount(app, {
            localVue,
            router,
        });
        const anchor = new Anchor(wrapper.vm);
        wrapper.vm.$anchor = anchor;

        wrapper.vm.$data.params.pageNum = 2;
        await wrapper.vm.$nextTick();
        expect(anchor.unpack(wrapper.vm.$route.query['params.pageNum'])).toBe(2);
    });
});
