const express = require('express');
const {
  BatchRecorder,
  ConsoleRecorder,
} = require('zipkin');
const ContextCLS = require('zipkin-context-cls');

const zipkinMiddleware = require('./');

describe('@govtechsg/mcf-zipkin-instrumentation', () => {
  it('exports a function', () => {
    expect(zipkinMiddleware).to.be.a('function');
  });

  it('has the correct keys', () => {
    expect(zipkinMiddleware).to.have.keys([
      '_context',
      'createContext',
      'getContext',
      '_instance',
      'createInstance',
      'getInstance',
      '_recorder',
      'createRecorder',
      'getRecorder',
      'createServiceId',
    ]);
  });

  describe('.constructor()', () => {
    let createServiceId = null;
    let createServiceIdSpy = null;
    
    before(() => {
      sinon.stub(zipkinMiddleware, 'createContext');
      sinon.stub(zipkinMiddleware, 'createInstance');
      sinon.stub(zipkinMiddleware, 'createRecorder');
      createServiceId = zipkinMiddleware.createServiceId;
      createServiceIdSpy = sinon.spy();
      zipkinMiddleware.createServiceId = (...args) => {
        createServiceIdSpy.apply(null, [...args])
        return createServiceId.apply(null, [...args]);
      };
    });

    after(() => {
      zipkinMiddleware.createContext.restore();
      zipkinMiddleware.createInstance.restore();
      zipkinMiddleware.createRecorder.restore();
      zipkinMiddleware.createServiceId = createServiceId;
    });
    
    afterEach(() => {
      zipkinMiddleware.createContext.resetHistory();
      zipkinMiddleware.createInstance.resetHistory();
      zipkinMiddleware.createRecorder.resetHistory();
      createServiceIdSpy.resetHistory();
    });

    it('returns a singleton instance', () => {
      const mockInstance = { test: 'ing', ref: () => 'erence' };
      zipkinMiddleware._instance = mockInstance;
      expect(zipkinMiddleware()).to.eq(mockInstance);
      zipkinMiddleware._instance = null;
      expect(zipkinMiddleware()).to.not.eq(mockInstance);
    });

    context('zipkinHostname specified', () => {
      const testServiceName = '_test_service_name';
      const testHostname = 'http://_test_service_hostname';

      it('works as expected', () => {
        zipkinMiddleware._instance = null;
        zipkinMiddleware(testServiceName, testHostname);
        expect(zipkinMiddleware.createContext).to.be.calledOnce;
        expect(zipkinMiddleware.createContext).to.be.calledWith(testServiceName);
        expect(zipkinMiddleware.createRecorder).to.be.calledOnce;
        expect(zipkinMiddleware.createRecorder).to.be.calledWith(testHostname);
        expect(zipkinMiddleware.createInstance).to.be.calledOnce;
        expect(zipkinMiddleware.createInstance).to.be.calledWith(
          testServiceName, undefined, undefined
        );
      });
    });

    context('zipkinHostname not specified', () => {
      const testServiceName = '_test_service_name';

      it('works as expected', () => {
        zipkinMiddleware._instance = null;
        zipkinMiddleware(testServiceName);
        expect(zipkinMiddleware.createContext).to.be.called;
        expect(zipkinMiddleware.createContext).to.be.calledWith(testServiceName);
        expect(zipkinMiddleware.createRecorder).to.be.called;
        expect(zipkinMiddleware.createRecorder).to.be.calledWith(null);
        expect(zipkinMiddleware.createInstance).to.be.called;
        expect(zipkinMiddleware.createInstance).to.be.calledWith(
          testServiceName, undefined, undefined
        );
      });
    });
  });

  describe('.createContext()', () => {
    it('exports a function', () => {
      expect(zipkinMiddleware.createContext).to.be.a('function');
    });

    it('returns an instance of ContextCLS', () => {
      expect(zipkinMiddleware.createContext('_test_service_name'))
        .to.be.an.instanceof(ContextCLS);
    });
  });

  describe('.createInstance()', () => {
    const testServiceName = '_test_service_name';
    const stubFunctionScoped = () => ({});

    it('returns an express compatible middleware', () => {
      const middleware = zipkinMiddleware.createInstance(
        testServiceName,
        { scoped: stubFunctionScoped },
        {}
      );
      const server = express();
      expect(() => server.use(middleware)).to.not.throw();
    });
  });

  describe('.createRecorder()', () => {
    it('exports a function', () => {
      expect(zipkinMiddleware.createRecorder).to.be.a('function');
    });

    it('returns an instance of BatchRecorder if hostname is specified', () => {
      expect(zipkinMiddleware.createRecorder('x')).to.be.instanceof(BatchRecorder);
    });

    it('returns an instance of ConsoleRecorder if hostname is not specified', () => {
      expect(zipkinMiddleware.createRecorder()).to.be.instanceof(ConsoleRecorder);
    });
  });

  describe('.createServiceId()', () => {
    it('exports a function', () => {
      expect(zipkinMiddleware.createServiceId).to.be.a('function');
    });

    it('does not add a postfix if no service name postfix is specified', () => {
      expect(zipkinMiddleware.createServiceId('x')).to.eql('x');
    });

    it('combines a service name with its postfix in dashed case', () => {
      expect(zipkinMiddleware.createServiceId('x', 'y')).to.eql('x-y');
      expect(zipkinMiddleware.createServiceId('x-y', 'z')).to.eql('x-y-z');
    });
  });

  describe('.getContext()', () => {
    it('works as expected', () => {
      zipkinMiddleware._context = '_context';
      expect(zipkinMiddleware.getContext()).to.eql('_context');
    });
  });
  
  describe('.getInstance()', () => {
    it('works as expected', () => {
      zipkinMiddleware._instance = '_instance';
      expect(zipkinMiddleware.getInstance()).to.eql('_instance');
    });
  });
  
  describe('.getRecorder()', () => {
    it('works as expected', () => {
      zipkinMiddleware._recorder = '_recorder';
      expect(zipkinMiddleware.getRecorder()).to.eql('_recorder');
    });
  });
});
