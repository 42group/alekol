import { UserRole } from '@alekol/shared/enums';
import { User } from '@alekol/shared/interfaces';
import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { IronSession } from 'iron-session';
import { SessionAuthGuard } from './session-auth.guard';

const userId = faker.datatype.uuid();
let mockSession: IronSession;

beforeEach(() => {
  mockSession = {
    destroy: jest.fn().mockResolvedValueOnce(undefined),
    save: jest.fn().mockResolvedValueOnce(undefined),
  };
  jest.clearAllMocks();
});

describe('SessionAuthGuard', () => {
  let reflector: DeepMocked<Reflector>;
  let guard: SessionAuthGuard;

  beforeEach(() => {
    reflector = createMock<Reflector>();
    guard = new SessionAuthGuard(reflector);
  });

  describe('requireNoRole', () => {
    describe('if no role is set', () => {
      it('should return true', () => {
        const result = guard.requireNoRole();
        expect(result).toBe(true);
      });
    });

    describe(`if the roles include '${UserRole.None}'`, () => {
      it.each<{ roles: UserRole[] }>([
        { roles: [UserRole.None] },
        { roles: [UserRole.Admin, UserRole.None] },
        { roles: [UserRole.Admin, UserRole.None, UserRole.User] },
        { roles: [UserRole.None, UserRole.User] },
        { roles: [UserRole.None, UserRole.Admin] },
      ])('should return true ($roles)', ({ roles }) => {
        const result = guard.requireNoRole(roles);
        expect(result).toBe(true);
      });
    });

    it.each<{ roles: UserRole[] }>([
      { roles: [UserRole.Admin] },
      { roles: [UserRole.User] },
      { roles: [UserRole.Admin, UserRole.User] },
    ])('should return false ($roles)', ({ roles }) => {
      const result = guard.requireNoRole(roles);
      expect(result).toBe(false);
    });
  });

  describe('canActivate', () => {
    let request: {
      session: IronSession;
    };
    let mockHttpArgumentHost: DeepMocked<HttpArgumentsHost>;
    let mockContext: DeepMocked<ExecutionContext>;

    beforeEach(() => {
      request = {
        session: mockSession,
      };

      mockHttpArgumentHost = createMock<HttpArgumentsHost>();
      mockHttpArgumentHost.getRequest.mockReturnValue(request);

      mockContext = createMock<ExecutionContext>();
      mockContext.switchToHttp.mockReturnValue(mockHttpArgumentHost);

      guard.requireNoRole = jest.fn().mockReturnValue(true);
    });

    it('should get the request', async () => {
      await guard.canActivate(mockContext);
      expect(mockContext.switchToHttp).toHaveBeenCalled();
      expect(mockHttpArgumentHost.getRequest).toHaveBeenCalled();
    });

    describe('if the session user does not exist', () => {
      it('should initialize it', async () => {
        await guard.canActivate(mockContext);
        expect(request.session.user).toStrictEqual<User>({
          accountLinking: {},
        });
      });
      it('should save the session', async () => {
        await guard.canActivate(mockContext);
        expect(request.session.save).toHaveBeenCalled();
      });
    });

    it('should get first roles metadata from the handler and the class', async () => {
      await guard.canActivate(mockContext);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        'roles',
        expect.any(Array)
      );
    });

    describe('if the handler requires no specific role', () => {
      it('should return true', async () => {
        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });
    });

    describe('if the user is logged in', () => {
      beforeEach(() => {
        request.session.user = {
          accountLinking: {},
          id: userId,
        };
        guard.requireNoRole = jest.fn().mockReturnValueOnce(false);
      });

      it('should return true', async () => {
        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
      });
    });

    describe('if the user is logged out', () => {
      beforeEach(() => {
        request.session.user = {
          accountLinking: {},
        };
        guard.requireNoRole = jest.fn().mockReturnValueOnce(false);
      });

      it('should return false', async () => {
        const result = await guard.canActivate(mockContext);
        expect(result).toBe(false);
      });
    });
  });
});
