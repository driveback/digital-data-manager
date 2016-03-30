import assert from 'assert';
import sinon from 'sinon';
import reset from './../reset.js';
import deleteProperty from './../../src/functions/deleteProperty.js';
import RetailRocket from './../../src/integrations/RetailRocket.js';
import ddManager from './../../src/ddManager.js';

describe('Integrations: RetailRocket', () => {
  // this var will be reused in all Retail Rocket tests
  // as Retail Rocket throws error when loaded few times
  let retailRocket;
  let stubsPrepared = false;

  const options = {
    partnerId: '567c343e6c7d3d14101afee5'
  };

  const prepareStubs = () => {
    window.rrApiOnReady.push = (fn) => {
      fn();
    };
    sinon.stub(window.rrApi, 'addToBasket');
    sinon.stub(window.rrApi, 'view');
    sinon.stub(window.rrApi, 'categoryView');
    sinon.stub(window.rrApi, 'order');
    sinon.stub(window.rrApi, 'pageView');
    stubsPrepared = true;
  };

  const restoreStubs = () => {
    window.rrApi.addToBasket.restore();
    window.rrApi.view.restore();
    window.rrApi.categoryView.restore();
    window.rrApi.order.restore();
    window.rrApi.pageView.restore();
  };

  before(() => {
    window.digitalData = {
      events: []
    };
    retailRocket = new RetailRocket(window.digitalData, options);
    ddManager.addIntegration(retailRocket);
  });

  after(() => {
    retailRocket.reset();
    ddManager.reset();
    reset();

    // stubs for callbacks (hack)
    window.rrApi = {};
    window.rrApi.pageViewCompleted = function() {};
    window.rrApi.setEmailCompleted = function() {};
  });

  describe('#constructor', () => {

    it('should create Retail Rocket integrations with proper options and tags', () => {
      assert.equal(options.partnerId, retailRocket.getOption('partnerId'));
      assert.equal('script', retailRocket.getTag().type);
      assert.ok(retailRocket.getTag().attr.src.indexOf('retailrocket.ru') > 0);
    });

  });

  describe('after loading', () => {

    before((done) => {
      sinon.stub(retailRocket, 'load', () => {
        rrApi._initialize = () => {};
        retailRocket.ready();
      });

      ddManager.once('ready', done);
      ddManager.initialize();
    });

    beforeEach(() => {
      prepareStubs();
    });

    afterEach(() => {
      if (stubsPrepared) {
        restoreStubs();
      }
      stubsPrepared = false;
    });

    it('should initialize all methods', () => {
      assert.ok(window.rrPartnerId, 'window.rrPartnerId is not defined');
      assert.ok(window.rrApi, 'window.rrApi is not defined');
      assert.ok(window.rrApiOnReady, 'window.rrApiOnReady is not defined');
      assert.ok(typeof window.rrApi.addToBasket === 'function', 'window.rrApi.addToBasket is not a function');
      assert.ok(typeof window.rrApi.order === 'function', 'window.rrApi.order is not a function');
      assert.ok(typeof window.rrApi.categoryView === 'function', 'window.rrApi.categoryView is not a function');
      assert.ok(typeof window.rrApi.view === 'function', 'window.rrApi.view is not a function');
      assert.ok(typeof window.rrApi.recomMouseDown === 'function', 'window.rrApi.recomMouseDown is not a function');
      assert.ok(typeof window.rrApi.recomAddToCart === 'function', 'window.rrApi.recomAddToCart is not a function');
    });


    describe('#onViewedProductCategory', () => {

      it('should track "Viewed Product Category" with categoryId param', (done) => {
        window.digitalData.events.push({
          name: 'Viewed Product Category',
          category: 'Ecommerce',
          page: {
            categoryId: '28'
          },
          callback: () => {
            assert.ok(true);
            done();
          }
        });
      });

      it('should throw validation error for "Viewed Product Category" event', (done) => {
        window.digitalData.page = {};
        window.digitalData.events.push({
          name: 'Viewed Product Category',
          category: 'Ecommerce',
          callback: (results, errors) => {
            assert.ok(errors.length > 0);
            assert.ok(errors[0].code === 'validation_error');
            done();
          }
        });
      });

    });

    describe('#onViewedProductDetail', () => {

      it('should track "Viewed Product Detail" with product.id param', (done) => {
        window.digitalData.events.push({
          name: 'Viewed Product Detail',
          category: 'Ecommerce',
          product: {
            id: '327'
          },
          callback: () => {
            assert.ok(true);
            done();
          }
        });
      });

      it('should track "Viewed Product Detail" event with product param', (done) => {
        window.digitalData.page = {
          type: 'product'
        };
        window.digitalData.events.push({
          name: 'Viewed Product Detail',
          category: 'Ecommerce',
          product: '327',
          callback: () => {
            assert.ok(true);
            done();
          }
        });
      });

      it('should throw validation error for "Viewed Product Detail" event', (done) => {
        window.digitalData.page = {};
        window.digitalData.product = {};
        window.digitalData.events.push({
          name: 'Viewed Product Detail',
          category: 'Ecommerce',
          callback: (results, errors) => {
            assert.ok(errors.length > 0);
            assert.ok(errors[0].code === 'validation_error');
            done();
          }
        });
      });

    });

    describe('#onAddedProduct', () => {

      it('should track "Added Product" with product.id param', (done) => {
        window.digitalData.events.push({
          name: 'Added Product',
          category: 'Ecommerce',
          product: {
            id: '327'
          },
          quantity: 1,
          callback: () => {
            assert.ok(window.rrApi.addToBasket.calledOnce);
            done();
          }
        });
      });

      it('should track "Added Product" event by product id', (done) => {
        window.digitalData.page = {
          type: 'product'
        };
        window.digitalData.events.push({
          name: 'Added Product',
          category: 'Ecommerce',
          product: '327',
          quantity: 1,
          callback: () => {
            assert.ok(window.rrApi.addToBasket.calledOnce);
            done();
          }
        });
      });

      it('should throw validation error for "Added Product" event', (done) => {
        window.digitalData.page = {};
        window.digitalData.product = {};
        window.digitalData.events.push({
          name: 'Added Product',
          category: 'Ecommerce',
          callback: (results, errors) => {
            assert.ok(errors.length > 0);
            assert.ok(errors[0].code === 'validation_error');
            done();
          }
        });
      });

    });

    describe('#onCompletedTransaction', () => {

      it('should track "Completed Transaction" with transaction param', (done) => {
        window.digitalData.events.push({
          name: 'Completed Transaction',
          category: 'Ecommerce',
          transaction: {
            orderId: '123',
            lineItems: [
              {
                product: {
                  id: '327',
                  unitSalePrice: 245
                },
                quantity: 1
              },
              {
                product: {
                  id: '328',
                  unitSalePrice: 245
                },
                quantity: 2
              }
            ]
          },
          callback: () => {
            assert.ok(true);
            done();
          }
        });
      });

      it('should track "Completed Transaction" with transaction param and product.unitPrice instead of product.unitSalePrice', (done) => {
        window.digitalData.events.push({
          name: 'Completed Transaction',
          category: 'Ecommerce',
          transaction: {
            orderId: '123',
            lineItems: [
              {
                product: {
                  id: '327',
                  unitPrice: 245
                },
                quantity: 1
              },
              {
                product: {
                  id: '328',
                  unitPrice: 245
                },
                quantity: 2
              }
            ]
          },
          callback: () => {
            assert.ok(true);
            done();
          }
        });
      });

      it('should throw validation error for "Completed Transaction" event when missing transaction param', (done) => {
        deleteProperty(window.digitalData, 'transaction');
        window.digitalData.events.push({
          name: 'Completed Transaction',
          category: 'Ecommerce',
          callback: (results, errors) => {
            assert.ok(errors.length > 0);
            assert.ok(errors[0].code === 'validation_error');
            done();
          }
        });
      });

      it('should throw validation error for "Completed Transaction" event when missing lineItems params', (done) => {
        window.digitalData.transaction = {
          orderId: '123',
        };
        window.digitalData.events.push({
          name: 'Completed Transaction',
          category: 'Ecommerce',
          callback: (results, errors) => {
            assert.ok(errors.length > 0);
            assert.ok(errors[0].code === 'validation_error');
            done();
          }
        });
      });

      it('should throw validation error for "Completed Transaction" event when missing product.id params', (done) => {
        window.digitalData.transaction = {
          orderId: '123',
          lineItems: [
            {
              product: {}
            },
            {
              product: {}
            }
          ]
        };
        window.digitalData.events.push({
          name: 'Completed Transaction',
          category: 'Ecommerce',
          callback: (results, errors) => {
            assert.ok(errors.length > 0, 'There was no errors');
            assert.ok(errors[0].code === 'validation_error', 'Error code is not correct');
            done();
          }
        });
      });

      it('should throw validation error for "Completed Transaction" event when missing lineItem quantity params', (done) => {
        window.digitalData.transaction = {
          orderId: '123',
          lineItems: [
            {
              product: {
                id: '327',
                unitSalePrice: 245
              }
            },
            {
              product: {
                id: '328',
                unitSalePrice: 245
              }
            }
          ]
        };
        window.digitalData.events.push({
          name: 'Completed Transaction',
          category: 'Ecommerce',
          callback: (results, errors) => {
            assert.ok(errors.length > 0, 'There was no errors');
            assert.ok(errors[0].code === 'validation_error', 'Error code is not correct');
            done();
          }
        });
      });

      it('should throw validation error for "Completed Transaction" event when missing product.unitSalePrice params', (done) => {
        window.digitalData.transaction = {
          orderId: '123',
          lineItems: [
            {
              product: {
                id: '327',
              },
              quantity: 1
            },
            {
              product: {
                id: '328',
              },
              quantity: 2
            }
          ]
        };
        window.digitalData.events.push({
          name: 'Completed Transaction',
          category: 'Ecommerce',
          callback: (results, errors) => {
            assert.ok(errors.length > 0);
            assert.ok(errors[0].code === 'validation_error');
            done();
          }
        });
      });

    });

    describe('#onSubscribed', () => {

      beforeEach(() => {
        sinon.stub(window.rrApi, "setEmail");
      });

      afterEach(() => {
        if (window.rrApi.setEmail.restore !== undefined) {
          window.rrApi.setEmail.restore();
        }
      });

      it('should track "Subscribed" with user.email param', (done) => {
        window.digitalData.events.push({
          name: 'Subscribed',
          category: 'Email',
          user: {
            email: 'test@driveback.ru'
          },
          callback: () => {
            assert.ok(window.rrApi.setEmail.calledOnce);
            done();
          }
        });
      });

      it('should throw validation error for "Subscribed" event', (done) => {
        window.digitalData.user = {};
        window.digitalData.events.push({
          name: 'Subscribed',
          category: 'Email',
          callback: (results, errors) => {
            assert.ok(errors.length > 0);
            assert.ok(errors[0].code === 'validation_error');
            assert.ok(!window.rrApi.setEmail.called);
            done();
          }
        });
      });

      it('should track email if user.email is set and user.isSubscribed is TRUE', () => {
        window.digitalData.user = {
          email: 'test@driveback.ru',
          isSubscribed: true
        };
        retailRocket.setOption('trackAllEmails', false);
        retailRocket.trackEmail();
        assert.ok(window.rrApi.setEmail.calledOnce);
      });

      it('should NOT track email if user.email is set and user.isSubscribed is FALSE', () => {
        window.digitalData.user = {
          email: 'test@driveback.ru',
          isSubscribed: false
        };
        retailRocket.setOption('trackAllEmails', false);
        retailRocket.trackEmail();
        assert.ok(!window.rrApi.setEmail.called);
      });

      it('should track email if user.email is set and user.isSubscribed is FALSE if trackAllEmail option is TRUE', () => {
        window.digitalData.user = {
          email: 'test@driveback.ru',
          isSubscribed: false
        };
        retailRocket.setOption('trackAllEmails', true);
        retailRocket.trackEmail();
        assert.ok(window.rrApi.setEmail.calledOnce);
      });

      it('should update user.email if rr_setemail is set', () => {
        window.digitalData.user = {};

        sinon.stub(retailRocket, 'getQueryString', function() {
          return '?rr_setemail=test@driveback.ru';
        });

        retailRocket.setOption('trackAllEmails', false);
        retailRocket.trackEmail();

        assert.ok(window.digitalData.user.email === 'test@driveback.ru');
        retailRocket.getQueryString.restore();
      });

      it('should track email anytime user.email updated if trackAllEmails is TRUE', (done) => {
        window.digitalData.user = {};

        // wait 101 while DDL changes listener will update to new state
        setTimeout(() => {
          if (window.rrApi.setEmail.restore !== undefined) {
            window.rrApi.setEmail.restore();
          }
          sinon.stub(window.rrApi, "setEmail", function() {
            assert.ok(true);
            done();
          });

          retailRocket.setOption('trackAllEmails', true);
          retailRocket.trackEmail();

          window.digitalData.user.email = 'test@driveback.ru';
        }, 101);
      });

      it('should NOT track email anytime user.email updated if trackAllEmails is FALSE', (done) => {
        window.digitalData.user = {};

        retailRocket.setOption('trackAllEmails', false);
        retailRocket.trackEmail();

        window.digitalData.user.email = 'test@driveback.ru';

        setTimeout(() => {
          assert.ok(!window.rrApi.setEmail.called);
          done();
        }, 101);
      });

    });

  });

});